import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiUsers, FiSearch, FiFilter, FiArrowRight, FiStar, FiCheckCircle } from 'react-icons/fi';

// Mock data for fallback
const MOCK_HALLS = [
  {
    _id: '1',
    name: 'The Grand Royale',
    location: 'Mumbai, Worli',
    capacity: 500,
    basePrice: 250000,
    images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }],
    facilities: ['Parking', 'AC', 'Stage', 'Sound System', 'Catering', 'WiFi'],
    description: 'An architectural masterpiece designed for grand celebrations.'
  },
  {
    _id: '2',
    name: 'Crystal Palace',
    location: 'Delhi, Connaught Place',
    capacity: 300,
    basePrice: 180000,
    images: [{ url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' }],
    facilities: ['Parking', 'AC', 'Stage', 'WiFi', 'Catering'],
    description: 'Elegant venue with crystal chandeliers and premium amenities.'
  },
  {
    _id: '3',
    name: 'Azure Gardens',
    location: 'Bangalore, Whitefield',
    capacity: 400,
    basePrice: 150000,
    images: [{ url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' }],
    facilities: ['Garden', 'Parking', 'AC', 'Stage', 'Photography', 'Catering'],
    description: 'Beautiful outdoor venue surrounded by lush gardens.'
  }
];

// Featured mock venues
const FEATURED_MOCK_HALLS = [
  {
    _id: 'royal-palace',
    name: 'The Royal Palace',
    location: 'Udaipur, Rajasthan',
    capacity: 800,
    basePrice: 250000,
    rating: 4.9,
    images: [{ url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200' }],
    facilities: ['Heritage Architecture', 'Lake View', 'Royal Gardens', 'Traditional Decor', 'Premium Catering', 'Bridal Suite', 'Photography Setup', 'Valet Parking'],
    description: 'A majestic heritage palace overlooking the pristine lakes of Udaipur. Experience royal grandeur with modern amenities in this architectural marvel that has hosted countless royal celebrations.',
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'grand-hyatt',
    name: 'Grand Hyatt Ballroom',
    location: 'Mumbai, Maharashtra',
    capacity: 500,
    basePrice: 180000,
    rating: 4.8,
    images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }],
    facilities: ['5-Star Hotel', 'Central AC', 'Grand Ballroom', 'Premium Sound System', 'International Cuisine', 'Bridal Suite', 'Concierge Service', 'Valet Parking'],
    description: 'Elegant sophistication meets modern luxury at the Grand Hyatt Ballroom. Located in the heart of Mumbai, this world-class venue offers impeccable service, state-of-the-art facilities, and culinary excellence.',
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'seaside-center',
    name: 'Seaside Convention Center',
    location: 'Goa, India',
    capacity: 300,
    basePrice: 120000,
    rating: 4.7,
    images: [{ url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' }],
    facilities: ['Beach Access', 'Outdoor & Indoor Spaces', 'Sea View', 'Tropical Decor', 'Seafood Catering', 'Sound System', 'Parking', 'Photography Setup'],
    description: 'A stunning beachside venue where the golden sands meet elegant architecture. Perfect for intimate celebrations with breathtaking ocean views. Experience the perfect blend of tropical paradise and sophisticated event hosting.',
    isFeatured: true,
    isActive: true
  }
];

const Halls = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => { fetchHalls(); }, []);
  useEffect(() => { filterHalls(); }, [halls, searchQuery, locationFilter, capacityFilter, priceRange]);

  const fetchHalls = async () => {
    try {
      console.log('📖 Fetching halls from API...');
      const response = await api.get('/halls');
      console.log('📖 Halls API response:', response.data);
      
      const data = response.data?.data || [];
      console.log(`📖 Found ${data.length} halls in database`);
      
      const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
      const availableMockVenues = FEATURED_MOCK_HALLS.filter(
        venue => !deletedMockVenues.includes(venue._id)
      );
      
      const allHalls = [...data, ...availableMockVenues];
      console.log(`✅ Total halls (including available mock): ${allHalls.length}`);
      
      if (allHalls.length > 0) {
        setHalls(allHalls);
        console.log('✅ Halls loaded from database and available mock venues added');
      } else {
        console.warn('⚠️ No halls found');
        setHalls([]);
      }
    } catch (error) {
      console.error('❌ Error fetching halls:', error);
      const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
      const availableMockVenues = FEATURED_MOCK_HALLS.filter(
        venue => !deletedMockVenues.includes(venue._id)
      );
      setHalls([...MOCK_HALLS, ...availableMockVenues]);
    } finally {
      setLoading(false);
    }
  };

  const filterHalls = () => {
    let filtered = [...halls];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hall =>
        hall.name.toLowerCase().includes(query) ||
        hall.location.toLowerCase().includes(query)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(hall =>
        hall.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (capacityFilter) {
      filtered = filtered.filter(hall => hall.capacity >= parseInt(capacityFilter));
    }

    if (priceRange.min) filtered = filtered.filter(hall => hall.basePrice >= parseFloat(priceRange.min));
    if (priceRange.max) filtered = filtered.filter(hall => hall.basePrice <= parseFloat(priceRange.max));

    setFilteredHalls(filtered);
  };

  const uniqueLocations = [...new Set(halls.map(hall => hall.location))];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black">
      
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-7xl mx-auto px-6 py-32 relative z-20">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Premium Venues</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6">Our <span className="text-[#D4AF37] font-serif italic">Venues</span></h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover our premium collection of event venues in Boring Road, Patna. Perfect for weddings, engagements, receptions, and corporate events.
          </p>
        </motion.div>

        {/* Key Features - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: <FiCheckCircle />, text: 'Premium Facilities' },
            { icon: <FiUsers />, text: '50-800 Capacity' },
            { icon: <FiStar />, text: 'Expert Coordination' },
            { icon: <FiMapPin />, text: 'Prime Location' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111] border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="text-2xl text-[#D4AF37] mb-2 flex justify-center">{item.icon}</div>
              <p className="text-sm text-gray-400">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 space-y-6"
        >
          <motion.div variants={itemVariants} className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
            >
              <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Location</label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#D4AF37] outline-none"
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Min Capacity</label>
                    <input
                      type="number"
                      value={capacityFilter}
                      onChange={(e) => setCapacityFilter(e.target.value)}
                      placeholder="e.g., 100"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        placeholder="Min"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#D4AF37] outline-none"
                      />
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        placeholder="Max"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Halls Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          <AnimatePresence>
            {filteredHalls.map((hall) => {
              const isExpanded = expandedCard === hall._id;
              return (
                <motion.div
                  key={hall._id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                >
                  <div 
                    className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden h-full hover:border-[#D4AF37]/50 transition-all duration-500 flex flex-col cursor-pointer"
                    onClick={(e) => {
                      if (e.target.closest('a')) {
                        return;
                      }
                      navigate(`/halls/${hall._id}`);
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={
                          hall.images && hall.images.length > 0
                            ? (typeof hall.images[0] === 'string' 
                                ? hall.images[0] 
                                : hall.images[0]?.url || hall.images[0])
                            : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'
                        } 
                        alt={hall.name} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 flex items-center gap-1 text-[10px] font-bold">
                        <FiMapPin className="text-[#D4AF37]" /> {hall.location}
                      </div>
                    </div>

                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className={`text-xl font-bold mb-1 text-white transition-colors line-clamp-1 ${isExpanded ? 'text-[#D4AF37]' : ''}`}>
                        {hall.name}
                      </h3>
                      
                      <motion.div 
                        className="relative overflow-hidden"
                        initial={false}
                        animate={{ 
                          height: isExpanded ? 'auto' : '2.5rem'
                        }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <p className={`text-gray-400 text-xs mb-3 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {hall.description}
                        </p>
                      </motion.div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="text-[#D4AF37] text-sm" /> 
                          <span>{hall.capacity} Guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#D4AF37] font-bold">₹</span> 
                          <span>₹{hall.basePrice || 0}</span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: '0.75rem' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="space-y-2 overflow-hidden"
                          >
                            {hall.amenities && hall.amenities.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="flex flex-wrap gap-1.5"
                              >
                                {hall.amenities.slice(0, 4).map((amenity, idx) => (
                                  <motion.span 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 + idx * 0.05, duration: 0.2 }}
                                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400"
                                  >
                                    {amenity}
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                            {hall.rating && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="flex items-center gap-1 text-xs text-gray-400"
                              >
                                <FiStar className="fill-[#D4AF37] text-[#D4AF37] text-sm" />
                                <span>{hall.rating.toFixed(1)} Rating</span>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="border-t border-white/10 pt-3 mt-auto flex justify-between items-center">
                        <Link 
                          to={`/halls/${hall._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-gray-500 font-bold tracking-widest uppercase hover:text-white transition-colors"
                        >
                          View Details
                        </Link>
                        <motion.span 
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                        >
                          <FiArrowRight className="text-sm" />
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredHalls.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-2">No venues found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
            <button 
              onClick={() => { setSearchQuery(''); setLocationFilter(''); setCapacityFilter(''); setPriceRange({ min: '', max: '' }); }}
              className="mt-4 text-[#D4AF37] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Simple CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl mb-4">
            Ready to Book Your <span className="text-[#D4AF37] italic">Venue?</span>
          </h2>
          <p className="text-gray-400 mb-8">Contact us to discuss your event requirements</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors"
          >
            Contact Us
            <FiArrowRight />
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default Halls;
