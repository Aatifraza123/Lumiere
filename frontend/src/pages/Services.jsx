import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { FiArrowRight, FiStar, FiSearch, FiFilter, FiChevronRight } from 'react-icons/fi';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchServices(); }, []);
  
  // Filter logic runs whenever search, category, or services change
  useEffect(() => { filterServices(); }, [services, searchQuery, selectedCategory]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services?isActive=true');
      const servicesData = response.data?.data || response.data || [];
      
      if (servicesData.length > 0) {
        const transformedServices = servicesData.map(service => ({
          _id: service._id,
          title: service.title || service.name,
          slug: service.slug || (service.title || service.name).toLowerCase().replace(/\s+/g, '-'),
          description: service.description || '',
          category: service.category || service.type || 'General',
          image: {
            url: service.image?.url || service.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
          },
          features: service.features || [],
          isPopular: service.isFeatured || false
        }));
        
        setServices(transformedServices);
        
        // Extract unique categories
        const uniqueCats = ['All', ...new Set(transformedServices.map(s => s.category))];
        setCategories(uniqueCats);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];
    
    // 1. Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    setFilteredServices(filtered);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Lato'] relative selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none z-[0]" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1a1a1a] to-transparent opacity-60 z-[0]" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* === 1. HEADER SECTION === */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="font-['Cinzel'] text-[#D4AF37] text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-4 block">
            Exceptional Hospitality
          </span>
          <h1 className="font-['Cinzel'] text-5xl md:text-7xl font-medium mb-6 leading-tight">
            Our <span className="text-[#D4AF37] italic font-serif">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            From luxurious room amenities to grand event planning, every detail is executed with precision to ensure your stay is unforgettable.
          </p>
        </motion.div>

        {/* === 2. CONTROL BAR (Search & Filter) === */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-24 z-30 mb-16"
        >
          <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
            
            {/* Search Input */}
            <div className="relative w-full md:w-1/2">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specific services..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none focus:bg-white/10 transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-1/2 pb-1 md:pb-0 scrollbar-hide">
               {categories.map((cat) => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-all duration-300 ${
                     selectedCategory === cat 
                       ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                       : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>
        </motion.div>

        {/* === 3. SERVICES GRID === */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            <AnimatePresence>
              {filteredServices.map((service, index) => (
                <motion.div
                  layout
                  key={service._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-pointer h-full flex flex-col"
                  onClick={() => navigate(`/services/${service._id}`)}
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={service.image?.url || service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-90" />
                    
                    {/* Badge */}
                    {service.isPopular && (
                      <div className="absolute top-4 right-4 bg-[#D4AF37]/90 backdrop-blur-md text-black px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <FiStar className="fill-black text-xs" /> Popular
                      </div>
                    )}
                    
                    {/* Category Tag */}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 text-white/80 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                      {service.category}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow relative">
                    {/* Decoration Line */}
                    <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#D4AF37]/50 transition-all duration-500"></div>

                    <h3 className="font-['Cinzel'] text-2xl font-medium mb-3 text-white group-hover:text-[#D4AF37] transition-colors">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 font-normal flex-grow">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <span className="text-xs text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">
                        Know More
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                         <FiArrowRight />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* === 4. EMPTY STATE === */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-500">
                <FiFilter />
            </div>
            <h3 className="text-2xl font-['Cinzel'] text-white mb-2">No services found</h3>
            <p className="text-gray-400 font-light">Try adjusting your search or category filter.</p>
            <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-6 text-[#D4AF37] text-sm underline underline-offset-4 hover:text-white transition-colors"
            >
                Clear all filters
            </button>
          </div>
        )}

        {/* === 5. BOTTOM CTA === */}
        <div className="relative mt-20 border-t border-white/10 pt-20">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-[#111] p-10 rounded-2xl border border-white/5">
              <div className="text-center md:text-left">
                  <h2 className="font-['Cinzel'] text-3xl text-white mb-2">Need a Custom Package?</h2>
                  <p className="text-gray-400 text-sm font-light">We specialize in tailoring experiences to your exact needs.</p>
              </div>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded hover:bg-[#D4AF37] transition-colors duration-300 flex items-center gap-2"
              >
                Contact Us <FiChevronRight />
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Services;

