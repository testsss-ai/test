require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Logging middleware
const bcrypt = require('bcrypt'); // For password hashing
const path = require('path'); // For resolving file paths
const User = require('./User'); // User model
const Booking = require('./Booking'); // Booking model
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev')); // Log requests to the console
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root Route
app.get('/', (req, res) => {
  // Respond to root URL with signup.html
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Sign-Up Route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists. Please try another one.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await newUser.save();
    return res.status(201).json({ message: 'User signed up successfully.' });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Sign up failed. Please try again later.' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Login failed. Please check your credentials.' });
    }

    // Check if the password matches using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      // Login successful
      return res.status(200).json({ message: 'Login successful!', username: user.username });
    } else {
      return res.status(401).json({ message: 'Login failed. Please check your credentials.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Booking Route
app.post('/book', async (req, res) => {
    const { username, service, date } = req.body;

    // Input validation
    if (!username || !service || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Create a new booking object
        const newBooking = {
            service,
            date: new Date(date) // Store the date
        };

        // Add the new booking to the user's bookings array
        user.bookings.push(newBooking); // Assuming 'bookings' is an array in the User model
        await user.save(); // Save the updated user document

        return res.status(201).json({ message: 'Booking successful!' });
    } catch (error) {
        console.error('Error booking service:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get All Bookings Route
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Bookings by Username
app.get('/bookings/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const bookings = await Booking.find({ username });
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found for this user.' });
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
