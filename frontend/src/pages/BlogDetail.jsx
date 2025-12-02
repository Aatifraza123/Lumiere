import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiClock, FiCalendar, FiUser, FiShare2, FiTwitter, FiFacebook, FiLinkedin, FiArrowLeft } from 'react-icons/fi';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blog/${slug}`);
      
      if (response.data && response.data.data) {
        const blogData = response.data.data;
        
        // Transform API data to match component structure
        const transformedBlog = {
          _id: blogData._id,
          title: blogData.title,
          slug: blogData.slug || slug,
          content: blogData.content || '',
          excerpt: blogData.excerpt || '',
          image: {
            url: blogData.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'
          },
          author: {
            name: blogData.author?.name || (typeof blogData.author === 'string' ? blogData.author : 'Admin'),
            title: blogData.author?.title || '',
            bio: blogData.author?.bio || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(blogData.author?.name || 'Admin')}&background=D4AF37&color=000&size=128`
          },
          createdAt: blogData.publishedAt || blogData.createdAt || new Date(),
          readTime: '5 min read', // Calculate based on content length if needed
          tags: Array.isArray(blogData.tags) ? blogData.tags : [],
          category: blogData.category || 'general',
          views: blogData.views || 0
        };
        
        setBlog(transformedBlog);
      } else {
        toast.error('Blog post not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error(error.response?.data?.message || 'Blog not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Article not found</p>
          <Link 
            to="/blog"
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-full font-bold hover:bg-[#FFD700] transition-colors inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black pb-20">
      
      {/* READING PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#D4AF37] origin-left z-50" style={{ scaleX }} />

      {/* HERO SECTION */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={blog.image?.url} alt={blog.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] mb-6 transition-colors text-sm uppercase tracking-wider font-bold">
            <FiArrowLeft /> Back to Journal
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            {blog.title}
          </motion.h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <img src={blog.author?.avatar} alt={blog.author?.name} className="w-8 h-8 rounded-full border border-[#D4AF37]" />
              <span className="font-bold text-white">{blog.author?.name}</span>
            </div>
            <span className="flex items-center gap-1"><FiCalendar /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><FiClock /> {blog.readTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        
        {/* SOCIAL SHARE (Sticky Sidebar) */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-32 flex flex-col gap-4 items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest rotate-180 mb-4" style={{ writingMode: 'vertical-rl' }}>Share Article</span>
            <button className="p-3 rounded-full bg-white/5 hover:bg-[#1DA1F2] hover:text-white transition-colors text-gray-400"><FiTwitter /></button>
            <button className="p-3 rounded-full bg-white/5 hover:bg-[#4267B2] hover:text-white transition-colors text-gray-400"><FiFacebook /></button>
            <button className="p-3 rounded-full bg-white/5 hover:bg-[#0077b5] hover:text-white transition-colors text-gray-400"><FiLinkedin /></button>
            <button className="p-3 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-black transition-colors text-gray-400"><FiShare2 /></button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-8">
          <article className="prose prose-lg prose-invert max-w-none 
            prose-headings:font-bold prose-headings:text-white 
            prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-[#D4AF37] prose-blockquote:text-xl prose-blockquote:italic prose-blockquote:text-gray-300
            prose-img:rounded-2xl prose-img:shadow-2xl
            prose-strong:text-white">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </article>

          {/* TAGS & MOBILE SHARE */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-2">
              {blog.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 hover:text-[#D4AF37] cursor-pointer transition-colors">#{tag}</span>
              ))}
            </div>
            <div className="flex gap-4 lg:hidden">
              <button className="p-2 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-black"><FiTwitter /></button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-black"><FiFacebook /></button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-black"><FiShare2 /></button>
            </div>
          </div>

          {/* AUTHOR BIO */}
          {blog.author && (blog.author.name || blog.author.bio) && (
            <div className="mt-16 p-8 bg-[#111] border border-white/10 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <img 
                src={blog.author?.avatar} 
                alt={blog.author?.name || 'Author'} 
                className="w-20 h-20 rounded-full border-2 border-[#D4AF37] object-cover" 
              />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{blog.author?.name || 'Admin'}</h3>
                {blog.author?.title && (
                  <p className="text-[#D4AF37] text-sm mb-3">{blog.author.title}</p>
                )}
                {blog.author?.bio && (
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {blog.author.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* TABLE OF CONTENTS (Sticky Sidebar) */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-32">
             <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-l-2 border-[#D4AF37] pl-3">On This Page</h4>
             <ul className="space-y-3 text-sm text-gray-500">
               <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">The Rise of Sustainable Luxury</li>
               <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">Intimate Gatherings</li>
               <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">Personalization is Key</li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogDetail;


