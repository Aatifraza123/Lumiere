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
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
});

export default router;





