const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's free tier only lets you send FROM "onboarding@resend.dev" until you
// verify your own domain. Once you verify a domain on resend.com/domains,
// set EMAIL_FROM in your env to something like "Eventora <noreply@yourdomain.com>".
const FROM_ADDRESS = process.env.EMAIL_FROM || 'Eventora <onboarding@resend.dev>';

const sendOtpEmail = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        });
        if (error) {
            console.error('Resend error (OTP email):', error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('sendOtpEmail failed:', err);
        throw err;
    }
};

const sendBookingEmail = async (email, name, eventTitle) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: email,
            subject: 'Booking Confirmed',
            text: `Hello ${name},

Your booking for "${eventTitle}" is confirmed.

Thank you for booking with Eventora.`
        });
        if (error) {
            console.error('Resend error (booking email):', error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('sendBookingEmail failed:', err);
        throw err;
    }
};

module.exports = {
    sendOtpEmail,
    sendBookingEmail
};