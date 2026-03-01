const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  campground: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campground',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);