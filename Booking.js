const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    username: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: Date, required: true }
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;
