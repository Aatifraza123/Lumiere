import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { FiMapPin, FiUsers, FiSearch, FiFilter, FiArrowRight, FiStar, FiCheckCircle, FiChevronDown, FiX } from 'react-icons/fi';

// --- MOCK DATA ---
const MOCK_HALLS = [
  { _id: '1', name: 'The Grand Royale', location: 'Mumbai, Worli', capacity: 500, basePrice: 250000, images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }], facilities: ['Parking', 'AC', 'Stage', 'Sound System', 'Catering', 'WiFi'], description: 'An architectural masterpiece designed for grand celebrations.' },
  { _id: '2', name: 'Crystal Palace', location: 'Delhi, Connaught Place', capacity: 300, basePrice: 180000, images: [{ url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' }], facilities: ['Parking', 'AC', 'Stage', 'WiFi', 'Catering'], description: 'Elegant venue with crystal chandeliers and premium amenities.' },
  { _id: '3', name: 'Azure Gardens', location: 'Bangalore, Whitefield', capacity: 400, basePrice: 150000, images: [{ url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' }], facilities: ['Garden', 'Parking', 'AC', 'Stage', 'Photography', 'Catering'], description: 'Beautiful outdoor venue surrounded by lush gardens.' }
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

  useEffect(() => { fetchHalls(); }, []);
  useEffect(() => { filterHalls(); }, [halls, searchQuery, locationFilter, capacityFilter, priceRange]);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/halls');
      const data = response.data?.data || [];
      const allHalls = data.length > 0 ? data : MOCK_HALLS;
      setHalls(allHalls);
    } catch (error) {
      console.error('Error fetching halls:', error);
      setHalls(MOCK_HALLS);
    } finally {
      setLoading(false);
    }
  };

  const filterHalls = () => {
    let filtered = [...halls];
    if (searchQuery) filtered = filtered.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase()));
    if (locationFilter) filtered = filtered.filter(h => h.location.toLowerCase().includes(locationFilter.toLowerCase()));
    if (capacityFilter) filtered = filtered.filter(h => h.capacity >= parseInt(capacityFilter));
    if (priceRange.min) filtered = filtered.filter(h => h.basePrice >= parseFloat(priceRange.min));
    if (priceRange.max) filtered = filtered.filter(h => h.basePrice <= parseFloat(priceRange.max));
    setFilteredHalls(filtered);
  };

  const uniqueLocations = [...new Set(halls.map(hall => hall.location))];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Lato'] relative selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none z-0" />
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* === 1. HEADER SECTION === */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="font-['Cinzel'] text-[#D4AF37] text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-4 block">
            Exclusive Spaces
          </span>
          <h1 className="font-['Cinzel'] text-5xl md:text-7xl font-medium mb-6 leading-tight">
            Our <span className="text-[#D4AF37] italic font-serif">Venues</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our premium collection of event venues in Boring Road, Patna. Perfect for weddings, corporate galas, and grand celebrations.
          </p>
        </motion.div>

        {/* === 2. INTERACTIVE FILTER BAR (Sticky Glass) === */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="sticky top-24 z-40 mb-12"
        >
          <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
               
               {/* Search Input */}
               <div className="relative flex-grow w-full md:w-auto">
                 <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search by name or location..."
                   className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-all"
                 />
               </div>

               {/* Filter Toggle Button */}
               <button
                 onClick={() => setShowFilters(!showFilters)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold transition-all w-full md:w-auto justify-center ${showFilters ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
               >
                 <FiFilter /> Filters {showFilters ? <FiChevronDown className="rotate-180 transition-transform" /> : <FiChevronDown />}
               </button>
            </div>

            {/* Expandable Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-2 border-t border-white/5">
                    
                    {/* Location Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Location</label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:border-[#D4AF37] outline-none"
                      >
                        <option value="">All Locations</option>
                        {uniqueLocations.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                      </select>
                    </div>

                    {/* Capacity Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Min Capacity</label>
                      <input
                        type="number"
                        value={capacityFilter}
                        onChange={(e) => setCapacityFilter(e.target.value)}
                        placeholder="e.g. 200"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:border-[#D4AF37] outline-none"
                      />
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Budget (₹)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          placeholder="Min"
                          className="w-1/2 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:border-[#D4AF37] outline-none"
                        />
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          placeholder="Max"
                          className="w-1/2 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:border-[#D4AF37] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Link */}
                  <div className="flex justify-end mt-4">
                     <button 
                        onClick={() => { setLocationFilter(''); setCapacityFilter(''); setPriceRange({min:'',max:''}); }}
                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                     >
                        <FiX /> Clear Filters
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* === 3. VENUE GRID === */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div></div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <AnimatePresence>
              {filteredHalls.map((hall, index) => (
                <motion.div
                  layout
                  key={hall._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-pointer flex flex-col h-full"
                  onClick={() => navigate(`/halls/${hall._id}`)}
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={hall.images?.[0]?.url || hall.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'} 
                      alt={hall.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-80" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[#D4AF37] px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-white/10">
                       <FiStar className="fill-[#D4AF37]" /> Premium
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 text-[10px] font-bold text-white">
                       <FiMapPin className="text-[#D4AF37]" /> {hall.location}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow relative">
                    <h3 className="font-['Cinzel'] text-2xl font-medium mb-2 text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {hall.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 border-b border-white/5 pb-4">
                       <span className="flex items-center gap-1"><FiUsers className="text-[#D4AF37]"/> {hall.capacity} Guests</span>
                       <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                       <span className="flex items-center gap-1 font-bold text-gray-300">₹{hall.basePrice.toLocaleString()}</span>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 font-normal">
                      {hall.description}
                    </p>

                    <div className="mt-auto flex justify-between items-center pt-2">
                       {/* Amenities Preview */}
                       <div className="flex gap-2">
                          {hall.facilities?.slice(0, 3).map((fac, i) => (
                             <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded text-gray-400 border border-white/5">{fac}</span>
                          ))}
                       </div>
                       <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
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
        {!loading && filteredHalls.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <h3 className="text-2xl font-['Cinzel'] text-white mb-2">No venues match your criteria</h3>
            <button 
                onClick={() => { setSearchQuery(''); setLocationFilter(''); setCapacityFilter(''); setPriceRange({min:'',max:''}); }}
                className="mt-4 text-[#D4AF37] text-sm underline underline-offset-4 hover:text-white transition-colors"
            >
                Clear all filters
            </button>
          </div>
        )}

        {/* === 5. BOTTOM CTA === */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-20 bg-[#111] border border-white/5 rounded-2xl p-10 overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <h2 className="font-['Cinzel'] text-3xl md:text-4xl mb-4 text-white relative z-10">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto font-light relative z-10">
             Our event specialists can help you find the perfect hidden gem that matches your specific requirements.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-sm rounded hover:bg-white transition-all duration-300 relative z-10"
          >
            Contact Our Team <FiArrowRight />
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default Halls;

