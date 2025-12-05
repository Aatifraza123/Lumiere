import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hall from '../models/Hall.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Helper function to generate slug from name
function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const fixSlugs = async () => {
  try {
    await connectDB();

    console.log('🔧 Starting slug fix...');
    
    // Find all halls with null, empty, or "null" string slugs
    const hallsWithBadSlugs = await Hall.find({
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' }
      ]
    });

    console.log(`📊 Found ${hallsWithBadSlugs.length} halls with invalid slugs`);

    let fixed = 0;
    let errors = 0;

    for (const hall of hallsWithBadSlugs) {
      try {
        if (!hall.name) {
          console.log(`⚠️  Skipping hall ${hall._id} - no name`);
          continue;
        }

        // Generate base slug
        let baseSlug = generateSlug(hall.name);
        
        if (!baseSlug) {
          baseSlug = `venue-${hall._id}`;
        }

        // Check for uniqueness
        let slug = baseSlug;
        let counter = 1;
        let existingHall = await Hall.findOne({ 
          slug: slug, 
          _id: { $ne: hall._id } 
        });

        while (existingHall) {
          slug = `${baseSlug}-${counter}`;
          existingHall = await Hall.findOne({ 
            slug: slug, 
            _id: { $ne: hall._id } 
          });
          counter++;
          if (counter > 1000) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
          }
        }

        // Update the hall
        hall.slug = slug;
        await hall.save();

        console.log(`✅ Fixed hall "${hall.name}" -> slug: "${slug}"`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing hall ${hall._id}:`, error.message);
        errors++;
      }
    }

    // Also fix any halls that have duplicate "null" slugs
    const nullSlugHalls = await Hall.find({ slug: 'null' });
    if (nullSlugHalls.length > 1) {
      console.log(`\n🔧 Fixing ${nullSlugHalls.length} halls with duplicate "null" slugs...`);
      
      for (let i = 0; i < nullSlugHalls.length; i++) {
        const hall = nullSlugHalls[i];
        try {
          let baseSlug = generateSlug(hall.name) || `venue-${hall._id}`;
          let slug = i === 0 ? baseSlug : `${baseSlug}-${i}`;
          
          // Ensure uniqueness
          let counter = 1;
          let existingHall = await Hall.findOne({ 
            slug: slug, 
            _id: { $ne: hall._id } 
          });
          
          while (existingHall) {
            slug = `${baseSlug}-${counter}`;
            existingHall = await Hall.findOne({ 
              slug: slug, 
              _id: { $ne: hall._id } 
            });
            counter++;
          }

          hall.slug = slug;
          await hall.save();
          
          console.log(`✅ Fixed duplicate null slug for "${hall.name}" -> "${slug}"`);
          fixed++;
        } catch (error) {
          console.error(`❌ Error fixing duplicate null slug for ${hall._id}:`, error.message);
          errors++;
        }
      }
    }

    console.log(`\n✅ Slug fix complete!`);
    console.log(`   - Fixed: ${fixed} halls`);
    console.log(`   - Errors: ${errors} halls`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in slug fix script:', error);
    process.exit(1);
  }
};

fixSlugs();





