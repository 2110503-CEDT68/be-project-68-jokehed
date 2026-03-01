const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a campground name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  telephone: {
    type: String,
    required: [true, 'Please add a telephone number']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CampgroundSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'campground',
  justOne: false
});

module.exports = mongoose.model(
    'Campground',
    CampgroundSchema
);