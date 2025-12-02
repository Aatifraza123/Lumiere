import mongoose from 'mongoose';

const priceSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const servicePricingSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: ['wedding', 'corporate', 'party', 'anniversary', 'engagement', 'other'],
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  }
});

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  basePrice: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 5;
      },
      message: 'Rating must be between 0 and 5'
    }
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  priceSlots: [priceSlotSchema],
  servicePricing: [servicePricingSchema],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

hallSchema.index({ name: 1 });
hallSchema.index({ location: 1 });
hallSchema.index({ isActive: 1, isFeatured: 1 });

export default mongoose.model('Hall', hallSchema);


