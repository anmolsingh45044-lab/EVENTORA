const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    await transporter.sendMail(mailOptions);
};

const sendBookingEmail = async (user) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Booking Confirmed',
        text: `Hello ${user.name},

Your booking is confirmed.
Your OTP is ${user.otp}.

Thank you for booking with Eventora.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendOtpEmail,
    sendBookingEmail
};
