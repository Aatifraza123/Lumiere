
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FiArrowRight, FiStar, FiSearch, FiGrid, FiHeart, FiBriefcase, FiGift, FiCalendar, 
  FiUsers, FiLayers, FiMusic, FiCamera, FiMapPin 
} from 'react-icons/fi';
import { BiParty, BiDrink } from 'react-icons/bi';

const CATEGORIES = [
  { value: 'all', label: 'All Services', icon: <FiGrid /> },
  { value: 'wedding', label: 'Wedding', icon: <FiHeart /> },
  { value: 'corporate', label: 'Corporate', icon: <FiBriefcase /> },
  { value: 'party', label: 'Party', icon: <BiParty /> },
  { value: 'anniversary', label: 'Anniversary', icon: <FiGift /> },
  { value: 'engagement', label: 'Engagement', icon: <FiUsers /> },
  { value: 'other', label: 'Other', icon: <FiCalendar /> }
];

// Modernized Mock Data
const MOCK_SERVICES = [
  {
    _id: '1',
    title: 'Royal Wedding Planning',
    slug: 'royal-wedding-planning',
    shortDescription: 'Complete wedding planning with all amenities',
    category: 'wedding',
    icon: <FiHeart />,
    image: { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800' },
    features: [
      { name: 'Venue Selection', icon: <FiMapPin /> },
      { name: 'Luxury Decor', icon: <FiStar /> },
      { name: 'Catering', icon: <BiDrink /> }
    ],
    pricing: { startingFrom: 500000, currency: 'INR' },
    isPopular: true
  },
  {
    _id: '2',
    title: 'Corporate Event Management',
    slug: 'corporate-event-management',
    shortDescription: 'Professional corporate event solutions',
    category: 'corporate',
    icon: <FiBriefcase />,
    image: { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
    features: [
      { name: 'AV Setup', icon: <FiLayers /> },
      { name: 'Catering', icon: <BiDrink /> },
      { name: 'Networking', icon: <FiUsers /> }
    ],
    pricing: { startingFrom: 300000, currency: 'INR' },
    isPopular: true
  },
  {
    _id: '3',
    title: 'Birthday Party Planning',
    slug: 'birthday-party-planning',
    shortDescription: 'Memorable birthday celebrations',
    category: 'party',
    icon: <BiParty />,
    image: { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800' },
    features: [
      { name: 'Themed Decor', icon: <FiStar /> },
      { name: 'Entertainment', icon: <FiMusic /> },
      { name: 'Cake & Food', icon: <BiDrink /> }
    ],
    pricing: { startingFrom: 50000, currency: 'INR' },
    isPopular: false
  }
];

// Helper functions
const getCategoryIcon = (category) => {
  const categoryMap = {
    wedding: <FiHeart />,
    corporate: <FiBriefcase />,
    party: <BiParty />,
    anniversary: <FiGift />,
    engagement: <FiUsers />,
    other: <FiCalendar />
  };
  return categoryMap[category] || <FiGrid />;
};

const getFeatureIcon = (featureName) => {
  const name = featureName.toLowerCase();
  if (name.includes('venue') || name.includes('location')) return <FiMapPin />;
  if (name.includes('decor') || name.includes('decoration')) return <FiStar />;
  if (name.includes('catering') || name.includes('food')) return <BiDrink />;
  if (name.includes('photography') || name.includes('photo')) return <FiCamera />;
  if (name.includes('music') || name.includes('entertainment')) return <FiMusic />;
  if (name.includes('av') || name.includes('audio')) return <FiLayers />;
  return <FiStar />;
};

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => { fetchServices(); }, []);
  useEffect(() => { filterServices(); }, [services, selectedCategory, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('📖 Fetching services from API...');
      const response = await api.get('/services?isActive=true');
      console.log('📖 Services API response:', response.data);
      
      const servicesData = response.data?.data || response.data || [];
      console.log(`📖 Found ${servicesData.length} services in database`);
      
      if (servicesData.length > 0) {
        // Transform API data to match component structure
        const transformedServices = servicesData.map(service => ({
          _id: service._id,
          title: service.title || service.name,
          slug: service.slug || (service.title || service.name).toLowerCase().replace(/\s+/g, '-'),
          shortDescription: service.description || service.shortDescription || '',
          category: service.category || service.type || 'other',
          icon: getCategoryIcon(service.category || service.type || 'other'),
          image: {
            url: service.image?.url || service.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
          },
          features: (service.features || []).slice(0, 3).map(f => ({
            name: typeof f === 'string' ? f : f.name,
            icon: getFeatureIcon(typeof f === 'string' ? f : f.name)
          })),
          pricing: {
            startingFrom: service.price || 0,
            currency: 'INR'
          },
          isPopular: service.isFeatured || false
        }));
        console.log('✅ Services loaded from database');
        setServices(transformedServices);
      } else {
        console.warn('⚠️ No services found in database');
        setServices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setServices([]);
      toast.error('Failed to load services. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };


  const filterServices = () => {
    let filtered = [...services];
    if (selectedCategory !== 'all') filtered = filtered.filter(s => s.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.title.toLowerCase().includes(q));
    }
    setFilteredServices(filtered);
  };


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black pb-20">
      
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-7xl mx-auto px-6 pt-32 relative z-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Our Expertise</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6">Curated <span className="font-serif italic text-[#D4AF37]">Services</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Bespoke event planning and management solutions tailored to your vision.
          </p>
        </motion.div>

        {/* Controls Section (Centered & Wrapped) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-6 border-y border-white/10 mb-16"
        >
          <div className="flex flex-col items-center gap-8">
            
            {/* Search Input */}
            <motion.div variants={itemVariants} className="relative w-full max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none focus:bg-white/10 transition-all"
              />
            </motion.div>

            {/* Category Pills (Wrapped) */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all
                    ${selectedCategory === cat.value 
                      ? 'bg-[#D4AF37] text-black' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </motion.div>

          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredServices.map((service) => {
              const isExpanded = expandedCard === service._id;
              return (
                <motion.div
                  key={service._id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.3 } }}
                >
                  <div 
                    className="relative h-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-colors duration-500 flex flex-col cursor-pointer"
                    onClick={(e) => {
                      // If clicking on the link, let it handle navigation
                      if (e.target.closest('a')) {
                        return;
                      }
                      // Otherwise, navigate to detail page
                      navigate(`/services/${service._id}`);
                    }}
                  >
                    
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={service.image?.url || service.image} 
                        alt={service.title} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                      {service.isPopular && (
                        <div className="absolute top-3 right-3 bg-[#D4AF37] text-black px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                          <FiStar className="fill-black text-xs" /> Popular
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white border border-white/20">
                        {service.icon}
                      </div>
                    </div>

                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className={`text-xl font-bold mb-1 text-white transition-colors line-clamp-1 ${isExpanded ? 'text-[#D4AF37]' : ''}`}>
                        {service.title}
                      </h3>
                      
                      {/* Description - expands on click */}
                      <motion.div 
                        className="relative overflow-hidden"
                        initial={false}
                        animate={{ 
                          height: isExpanded ? 'auto' : '2.5rem'
                        }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <p className={`text-gray-400 text-xs mb-3 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {service.shortDescription}
                        </p>
                      </motion.div>

                      {/* Compact features */}
                      <div className="flex gap-2 mb-3">
                        {service.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 text-xs border border-white/10" title={f.name}>
                            {f.icon}
                          </div>
                        ))}
                      </div>

                      {/* Details - shows on click with smooth animation */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: '0.75rem' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="space-y-2 overflow-hidden"
                          >
                            {service.features.length > 3 && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="flex flex-wrap gap-1.5"
                              >
                                {service.features.slice(3, 6).map((f, i) => (
                                  <motion.span 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 + i * 0.05, duration: 0.2 }}
                                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400"
                                  >
                                    {f.name}
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                            {service.category && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="text-[10px] text-gray-500 uppercase tracking-wider"
                              >
                                {service.category}
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="border-t border-white/10 pt-3 flex items-center justify-end mt-auto">
                        <Link 
                          to={`/services/${service._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                        >
                          <span>View Details</span>
                          <motion.span 
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-7 h-7 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                          >
                            <FiArrowRight className="text-sm" />
                          </motion.span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-2">No services found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
            <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="mt-6 text-[#D4AF37] hover:underline">
              Clear all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Services;

