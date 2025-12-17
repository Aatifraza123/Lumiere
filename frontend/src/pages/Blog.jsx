import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { FiArrowRight, FiClock, FiCalendar } from 'react-icons/fi';

// --- SKELETON ---
const BlogSkeleton = () => (
  <div className="w-full animate-pulse bg-[#161616] rounded-xl overflow-hidden h-[350px] border border-white/5">
    <div className="bg-white/5 h-48 w-full" />
    <div className="p-6 space-y-4">
      <div className="h-4 bg-white/5 rounded w-1/4" />
      <div className="h-6 bg-white/5 rounded w-3/4" />
    </div>
  </div>
);

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blog');
      if (response.data && response.data.data) {
        const transformedBlogs = response.data.data.map(blog => {
          let imageUrl = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200';
          if (blog.image && blog.image.trim()) {
             imageUrl = blog.image.startsWith('/uploads/') 
               ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${blog.image}`
               : blog.image;
          }
          
          return {
            _id: blog._id,
            title: blog.title,
            slug: blog.slug || blog.title.toLowerCase().replace(/\s+/g, '-'),
            excerpt: blog.excerpt || blog.content?.substring(0, 120) + '...',
            image: { url: imageUrl },
            date: new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            readTime: '5 min read',
            category: blog.category || 'Insights',
            author: blog.author?.name || 'Lumiere Team'
          };
        });
        setBlogs(transformedBlogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background: Softer Dark Gray (Less Harsh than Black)
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-[#D4AF37] selection:text-black pb-24">
      
      {/* === HEADER SECTION === */}
      <div className="pt-32 pb-16 px-6 border-b border-white/5 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
             <span className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Journal</span>
             <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
               Stories & <span className="italic text-gray-500">Updates</span>
             </h1>
           </div>
           <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed pb-2">
             Explore our latest news, event inspirations, and behind-the-scenes glimpses from Lumiere.
           </p>
        </div>
      </div>

      {/* === CONTENT GRID === */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1, 2, 3].map(i => <BlogSkeleton key={i} />)}
           </div>
        ) : blogs.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
              <p className="text-gray-500 text-lg">No articles found. Check back later.</p>
           </div>
        ) : (
           <div className="space-y-16">
              
              {/* 1. FEATURED ARTICLE (Side-by-Side Layout - Cleaner) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/20 transition-all duration-300"
              >
                 <Link to={`/blog/${blogs[0].slug}`} className="grid grid-cols-1 lg:grid-cols-2 h-full">
                    {/* Image Side */}
                    <div className="relative h-[300px] lg:h-auto overflow-hidden">
                       <img 
                         src={blogs[0].image.url} 
                         alt="Featured" 
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                       />
                       <div className="absolute top-6 left-6">
                          <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border border-white/10">
                             Featured
                          </span>
                       </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                       <div className="flex items-center gap-3 text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-2"><FiCalendar className="text-sm"/> {blogs[0].date}</span>
                       </div>
                       
                       <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-tight group-hover:text-[#D4AF37] transition-colors">
                          {blogs[0].title}
                       </h2>
                       
                       <p className="text-gray-400 text-base leading-relaxed mb-8 line-clamp-3">
                          {blogs[0].excerpt}
                       </p>
                       
                       <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all">
                          Read Article <FiArrowRight className="text-[#D4AF37]"/>
                       </div>
                    </div>
                 </Link>
              </motion.div>

              {/* 2. RECENT ARTICLES GRID (Standard 3-Column) */}
              {blogs.length > 1 && (
                <div>
                  <h3 className="text-lg font-serif text-white mb-8 border-l-2 border-[#D4AF37] pl-4">Recent Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.slice(1).map((blog, index) => (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                          <Link to={`/blog/${blog.slug}`} className="group block bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/30 transition-all hover:-translate-y-1 hover:shadow-lg">
                            {/* Card Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img 
                                  src={blog.image.url} 
                                  alt={blog.title} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0" 
                                />
                                <div className="absolute bottom-3 right-3 bg-black/80 text-[#D4AF37] text-[10px] font-bold px-2 py-1 rounded">
                                  {blog.category}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                                  <span>{blog.date}</span>
                                  <span className="w-1 h-1 bg-gray-600 rounded-full"/>
                                  <span>{blog.readTime}</span>
                                </div>
                                
                                <h3 className="text-xl font-serif text-white mb-3 leading-snug group-hover:text-[#D4AF37] transition-colors">
                                  {blog.title}
                                </h3>
                                
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                  {blog.excerpt}
                                </p>

                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-white transition-colors flex items-center gap-2">
                                  Read More <FiArrowRight className="w-3 h-3"/>
                                </span>
                            </div>
                          </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

           </div>
        )}
      </div>
    </div>
  );
};

export default Blog;






