import express from 'express';
import Blog from '../models/Blog.model.js';

const router = express.Router();

// @route   GET /api/blog
// @desc    Get all published blog posts
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { category, limit } = req.query;
    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    let blogQuery = Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
    if (limit) {
      blogQuery = blogQuery.limit(parseInt(limit));
    }

    const blogs = await blogQuery;
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/blog/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/:slug', async (req, res, next) => {
  try {
    console.log('📖 GET /api/blog/:slug - Request received');
    console.log('📖 Slug:', req.params.slug);
    
    // Try to find by slug first
    let blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    
    // If not found by slug, try to find by ID (for backward compatibility)
    if (!blog) {
      blog = await Blog.findOne({ _id: req.params.slug, isPublished: true });
    }
    
    if (!blog) {
      console.log('❌ Blog not found for slug:', req.params.slug);
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found',
        slug: req.params.slug
      });
    }

    console.log('✅ Blog found:', blog.title);

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    next(error);
  }
});

export default router;





