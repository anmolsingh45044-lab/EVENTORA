const booking=require('../routes/booking.js');  
const OTP=require('../postmodel/otp');
const Event=require('../postmodel/event.js');
const {sendBookingEmail,sendOtpEmail}=require('../utils/email');


const generateOtp = () => { 
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOtp=async(req,res)=>{
    const otp=generateOtp();
    await OTP.findOneAndDelete({email:req.body.email,action:'event_booking'});
    await OTP.create({email:req.body.email,otp,action:'event_booking'});
    await sendOtpEmail(req.body.email,otp);
    res.json({message:"OTP sent to email"})
}

exports.bookEvent=async(req,res)=>{
    const{eventId,otp}=req.body;
    const otpRecord=await OTP.findOne({email,otp,action:'event_booking'});
    if(!otpRecord){
        return res.status(400).json({error:"Invalid OTP"})
    }
    const event=await Event.findById(eventId);
    if(!event){
        return res.status(404).json({error:"Event not found"})
    }
    if(event.totalSeats<=0){
        return res.status(400).json({error:"No seats available"})
    }
    if(existingBooking){
        return res.status(400).json({error:"You have already booked this event"})
    }
    const booking = await booking.create({
        userId: req.user._id,
        eventId: event._id,
        status:'pending',
        paymentStatus:'non_paid',
        amount:event.ticketPrice
    });
   
await OTP.deleteMany({email:req.user.email,action:'event_booking'});
res.status(201).json({message:"Booking successful",booking})
}

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        const event = await Event.findById(booking.eventId._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
    
