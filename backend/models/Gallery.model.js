import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['wedding', 'corporate', 'party', 'anniversary', 'engagement', 'other'],
    default: 'other'
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

gallerySchema.index({ category: 1 });
gallerySchema.index({ isActive: 1 });

export default mongoose.model('Gallery', gallerySchema);





