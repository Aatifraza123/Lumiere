import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { FiArrowRight, FiClock, FiCalendar, FiUser } from 'react-icons/fi';

// --- SKELETON COMPONENT ---
const BlogSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="bg-white/10 h-48 md:h-64 w-full rounded-2xl mb-4" />
    <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
    <div className="h-8 bg-white/10 rounded w-3/4 mb-3" />
    <div className="h-4 bg-white/10 rounded w-full mb-2" />
    <div className="h-4 bg-white/10 rounded w-2/3" />
  </div>
);

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Mock Data removed - only use real blogs from database

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blog');
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Transform API data to match component structure
        const transformedBlogs = response.data.data.map(blog => {
          // Handle image URL - use blog.image if it exists and is valid, otherwise use default
          let imageUrl = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200';
          if (blog.image && blog.image.trim() && blog.image !== 'undefined') {
            imageUrl = blog.image.trim();
            // If it's a relative path, prepend backend URL
            if (imageUrl.startsWith('/uploads/')) {
              const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              imageUrl = `${backendUrl}${imageUrl}`;
            }
          }
          
          return {
            _id: blog._id,
            title: blog.title,
            slug: blog.slug || blog.title.toLowerCase().replace(/\s+/g, '-'),
            excerpt: blog.excerpt || blog.content?.substring(0, 150) + '...',
            image: { url: imageUrl },
            date: blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            readTime: '5 min read',
            author: blog.author?.name || (typeof blog.author === 'string' ? blog.author : 'Admin'),
            authorObj: blog.author,
            category: blog.category || 'general'
          };
        });
        setBlogs(transformedBlogs);
      } else {
        // No blogs in database - show empty state
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // On error, show empty state instead of mock data
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black pb-20">
      
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-7xl mx-auto px-6 pt-32 relative z-20">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">The Journal</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6">Insights & <span className="font-serif italic text-[#D4AF37]">Stories</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Expert advice, industry trends, and inspiration for your next grand celebration.
          </p>
        </motion.div>

        {/* BLOG GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => <BlogSkeleton key={n} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No blog posts available yet.</p>
            <p className="text-gray-500 text-sm">Check back soon for updates!</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* FEATURED POST (First Item) */}
            {blogs.length > 0 && (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                className="lg:col-span-3 group relative cursor-pointer mb-12"
              >
                <Link to={`/blog/${blogs[0].slug}`} className="block relative h-[500px] rounded-[2rem] overflow-hidden">
                  <img 
                    src={blogs[0].image?.url} 
                    alt={blogs[0].title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                    <div className="flex items-center gap-4 text-sm text-[#D4AF37] mb-4 uppercase tracking-wider font-bold">
                      <span>{blogs[0].date}</span>
                      <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                      <span>{blogs[0].readTime}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight group-hover:text-[#D4AF37] transition-colors">
                      {blogs[0].title}
                    </h2>
                    <p className="text-gray-300 text-lg line-clamp-2 mb-6">
                      {blogs[0].excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                      Read Full Story <FiArrowRight />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* STANDARD POSTS */}
            {blogs.slice(1).map((blog) => (
              <motion.div
                key={blog._id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.3 } }}
                className="group flex flex-col h-full"
              >
                <Link to={`/blog/${blog.slug}`} className="block h-full bg-[#111] border border-white/10 rounded-3xl overflow-hidden hover:border-[#D4AF37]/50 transition-colors duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={blog.image?.url} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                      {blog.category || 'Event Tips'}
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><FiCalendar /> {blog.date}</span>
                      <span className="flex items-center gap-1"><FiClock /> {blog.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-black text-xs font-bold">
                          {(blog.author?.name || blog.author || 'A')?.charAt(0).toUpperCase()}
                        </div>
                        {blog.author?.name || blog.author || 'Admin'}
                      </div>
                      <FiArrowRight className="text-gray-500 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;



