const mongoose = require('mongoose');

// Define the schema for each booking
const BookingSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

// Modify the User schema to include an array of bookings
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure that email addresses are unique
  },
  password: {
    type: String,
    required: true,
  },
  bookings: [BookingSchema], // Embed BookingSchema as an array inside the User schema
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
