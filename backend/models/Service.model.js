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
  category: {
    type: String,
    enum: ['wedding', 'corporate', 'party', 'birthday', 'anniversary', 'engagement', 'other'],
    required: true
  },
  type: {
    type: String,
    trim: true
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

// Helper function to generate slug from name/title
function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate slug from title/name before saving
serviceSchema.pre('save', async function(next) {
  try {
    // Always generate slug if it's missing, null, empty, or the string "null"
    const slugValue = this.slug;
    const isSlugInvalid = !slugValue || 
                         slugValue === 'null' || 
                         slugValue === null || 
                         slugValue === undefined ||
                         (typeof slugValue === 'string' && slugValue.trim() === '');
    
    // Get service name (prefer title, then name)
    const serviceName = this.title || this.name;
    
    if (isSlugInvalid && serviceName) {
      // Generate slug from name
      let baseSlug = generateSlug(serviceName);
      
      // Ensure slug is unique
      if (baseSlug) {
        let slug = baseSlug;
        let counter = 1;
        let existingService = await this.constructor.findOne({ 
          slug: slug, 
          _id: { $ne: this._id } 
        });
        
        while (existingService) {
          slug = `${baseSlug}-${counter}`;
          existingService = await this.constructor.findOne({ 
            slug: slug, 
            _id: { $ne: this._id } 
          });
          counter++;
          // Safety check to prevent infinite loop
          if (counter > 1000) {
            // Fallback: use timestamp
            slug = `${baseSlug}-${Date.now()}`;
            break;
          }
        }
        
        this.slug = slug;
      } else {
        // If name doesn't generate valid slug, use ID-based fallback
        this.slug = `service-${this._id || Date.now()}`;
      }
    } else if (this.isModified('title') || this.isModified('name')) {
      // If title/name changed, regenerate slug
      if (serviceName) {
        let baseSlug = generateSlug(serviceName);
        
        if (baseSlug && baseSlug !== this.slug) {
          let slug = baseSlug;
          let counter = 1;
          let existingService = await this.constructor.findOne({ 
            slug: slug, 
            _id: { $ne: this._id } 
          });
          
          while (existingService) {
            slug = `${baseSlug}-${counter}`;
            existingService = await this.constructor.findOne({ 
              slug: slug, 
              _id: { $ne: this._id } 
            });
            counter++;
            if (counter > 1000) {
              slug = `${baseSlug}-${Date.now()}`;
              break;
            }
          }
          
          this.slug = slug;
        }
      }
    }
    
    // Final safety check: never allow "null" string
    if (this.slug === 'null' || this.slug === null || this.slug === undefined) {
      if (serviceName) {
        this.slug = generateSlug(serviceName) || `service-${this._id || Date.now()}`;
      } else {
        this.slug = `service-${this._id || Date.now()}`;
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in service slug pre-save hook:', error);
    // Fallback: generate basic slug
    if (!this.slug || this.slug === 'null') {
      const serviceName = this.title || this.name;
      this.slug = serviceName ? generateSlug(serviceName) : `service-${Date.now()}`;
    }
    next();
  }
});

serviceSchema.index({ category: 1 });
serviceSchema.index({ slug: 1 }, { unique: true, sparse: true });
serviceSchema.index({ isActive: 1 });

export default mongoose.model('Service', serviceSchema);







