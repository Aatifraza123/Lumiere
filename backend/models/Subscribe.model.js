import mongoose from 'mongoose';

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
});

subscribeSchema.index({ email: 1 });
subscribeSchema.index({ isActive: 1 });

export default mongoose.model('Subscribe', subscribeSchema);








