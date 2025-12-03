import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['wedding', 'corporate', 'party', 'birthday', 'anniversary', 'engagement', 'other'],
    required: true
  },
  type: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

export default mongoose.model('Service', serviceSchema);







