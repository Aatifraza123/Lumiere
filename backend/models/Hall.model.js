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
  slug: {
    type: String,
    unique: true,
    sparse: true,
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

// Generate slug from name before saving
hallSchema.pre('save', async function(next) {
  try {
    // Always generate slug if it's missing or null
    if (!this.slug || this.slug === 'null' || this.slug.trim() === '') {
      if (this.name) {
        // Generate slug from name
        let baseSlug = this.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Ensure slug is unique
        if (baseSlug) {
          let slug = baseSlug;
          let counter = 1;
          let existingHall = await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } });
          
          while (existingHall) {
            slug = `${baseSlug}-${counter}`;
            existingHall = await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } });
            counter++;
            // Safety check to prevent infinite loop
            if (counter > 1000) break;
          }
          
          this.slug = slug;
        }
      }
    } else if (this.isModified('name') && this.slug) {
      // If name changed, regenerate slug
      let baseSlug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (baseSlug) {
        let slug = baseSlug;
        let counter = 1;
        let existingHall = await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } });
        
        while (existingHall) {
          slug = `${baseSlug}-${counter}`;
          existingHall = await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } });
          counter++;
          if (counter > 1000) break;
        }
        
        this.slug = slug;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

hallSchema.index({ name: 1 });
hallSchema.index({ slug: 1 }, { unique: true, sparse: true });
hallSchema.index({ location: 1 });
hallSchema.index({ isActive: 1, isFeatured: 1 });

export default mongoose.model('Hall', hallSchema);


