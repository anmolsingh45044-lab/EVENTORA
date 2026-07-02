const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
       default:null,
    },
    action: {
        type: String,
        enum: ['account_verification', 'event_booking'],
        default: 'account_verification',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

module.exports = mongoose.model('OTP', otpSchema);
