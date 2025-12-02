import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 }
});

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'corporate', 'party', 'anniversary', 'engagement', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  addons: [addonSchema],
  basePrice: {
    type: Number,
    required: true
  },
  slotPrice: {
    type: Number,
    default: 0
  },
  addonsTotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  advancePercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancellationReason: String,
  notes: String,
  invoiceNumber: String,
  customerName: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  customerMobile: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ hallId: 1, date: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);





