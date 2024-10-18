// Booking.js
const mongoose = require('mongoose');

// Define the schema for the booking
const BookingSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Link booking to username
    service: { type: String, required: true },
    date: { type: Date, required: true }
});

// Create the Booking model with the collection name 'historybookings'
const Booking = mongoose.model('Booking', BookingSchema, 'historybookings');

module.exports = Booking;
