const express = require('express');
const router = express.Router();
const { protect,admin } = require('../middleware/auth');
const { bookEvent, getMyBookings, cancelBooking, confirmBooking,sendBookingOtp } = require('../controller/bookingController');

// Create a new booking
router.post('/', protect, bookEvent);

// Get bookings for the logged-in user
router.get('/my-bookings', protect, getMyBookings);

//cancel booking
router.delete('/:id', protect,  cancelBooking);

// Update booking status (admin only)
router.put('/:id/confirm', protect,admin, confirmBooking);

router.post('/send-otp', protect, sendBookingOtp);

module.exports = router;