import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiUsers, FiSearch, FiFilter, FiArrowRight, FiStar, FiCheckCircle, FiCoffee, FiShield, FiWifi, FiMusic, FiCamera, FiHome, FiHeart, FiBriefcase, FiAward } from 'react-icons/fi';

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
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Premium Venues</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6">Our <span className="text-[#D4AF37] font-serif italic">Venues</span></h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover our exquisite collection of premium event venues, each meticulously designed to transform your celebrations into unforgettable experiences.
          </p>
        </motion.div>

        {/* Venue Overview Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6 text-center">
              Venue <span className="text-[#D4AF37] italic">Overview</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-gray-300 text-lg font-light leading-relaxed">
                <p>
                  At Lumière, we understand that the perfect venue sets the stage for extraordinary moments. Our carefully curated collection of premium venues in Boring Road, Patna, represents the pinnacle of elegance, sophistication, and functionality.
                </p>
                <p>
                  Each venue in our portfolio has been selected for its unique character, exceptional amenities, and ability to accommodate events of all scales—from intimate gatherings to grand celebrations. Whether you're planning a dream wedding, an elegant engagement ceremony, a memorable reception, or a professional corporate event, our venues provide the perfect backdrop.
                </p>
                <p>
                  Our venues boast impressive capacities ranging from intimate spaces for 50 guests to grand halls accommodating over 800 attendees. Every space is thoughtfully designed with modern amenities, ensuring comfort, convenience, and an atmosphere that reflects your vision.
                </p>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200" 
                  alt="Venue Overview" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Hall Types Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-12 text-center">
              Hall <span className="text-[#D4AF37] italic">Types</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <FiHeart />,
                  title: 'Wedding Halls',
                  desc: 'Spacious, elegantly designed halls perfect for traditional and modern weddings. Features include grand stages, bridal suites, and dedicated areas for ceremonies and receptions.',
                  capacity: '200-800 guests'
                },
                {
                  icon: <FiCoffee />,
                  title: 'Reception Venues',
                  desc: 'Sophisticated spaces ideal for post-wedding receptions and celebrations. Equipped with dance floors, premium sound systems, and elegant lighting for memorable evenings.',
                  capacity: '150-500 guests'
                },
                {
                  icon: <FiBriefcase />,
                  title: 'Corporate Halls',
                  desc: 'Professional venues designed for business events, conferences, and corporate gatherings. Features include AV equipment, meeting rooms, and high-speed WiFi.',
                  capacity: '50-300 guests'
                },
                {
                  icon: <FiStar />,
                  title: 'Engagement Venues',
                  desc: 'Intimate and romantic spaces perfect for engagement ceremonies. Beautifully decorated with attention to detail, creating the perfect atmosphere for this special milestone.',
                  capacity: '50-200 guests'
                },
                {
                  icon: <FiHome />,
                  title: 'Banquet Halls',
                  desc: 'Versatile spaces suitable for various celebrations including anniversaries, birthdays, and family gatherings. Flexible layouts accommodate different event styles.',
                  capacity: '100-400 guests'
                },
                {
                  icon: <FiAward />,
                  title: 'Premium Suites',
                  desc: 'Exclusive, luxury venues for VIP events and intimate celebrations. Featuring premium amenities, personalized service, and bespoke decor options.',
                  capacity: '30-150 guests'
                }
              ].map((hall, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500"
                >
                  <div className="text-5xl text-[#D4AF37] mb-6">{hall.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{hall.title}</h3>
                  <p className="text-gray-400 mb-4 font-light leading-relaxed">{hall.desc}</p>
                  <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
                    <FiUsers />
                    <span>{hall.capacity}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-12 text-center">
              Premium <span className="text-[#D4AF37] italic">Features</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <FiShield />, title: '24/7 Security', desc: 'Round-the-clock security and surveillance for your peace of mind' },
                { icon: <FiWifi />, title: 'High-Speed WiFi', desc: 'Complimentary high-speed internet connectivity throughout the venue' },
                { icon: <FiMusic />, title: 'Premium Sound System', desc: 'State-of-the-art audio equipment for crystal-clear sound quality' },
                { icon: <FiCamera />, title: 'Photography Setup', desc: 'Dedicated spaces and lighting for professional photography' },
                { icon: <FiCoffee />, title: 'In-House Catering', desc: 'Exquisite culinary experiences with customizable menus' },
                { icon: <FiHome />, title: 'Bridal Suites', desc: 'Luxurious private spaces for preparation and relaxation' },
                { icon: <FiCheckCircle />, title: 'Valet Parking', desc: 'Complimentary valet parking services for all guests' },
                { icon: <FiAward />, title: 'Event Coordination', desc: 'Dedicated event managers to ensure flawless execution' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all duration-500 text-center"
                >
                  <div className="text-4xl text-[#D4AF37] mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400 font-light">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* What Makes Us Special Section */}
        <section className="mb-24 bg-[#111] border border-white/10 rounded-3xl p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6">
              What Makes <span className="text-[#D4AF37] italic">Lumière</span> Special
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto font-light">
              Discover why discerning clients choose us for their most important celebrations
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Prime Location',
                desc: 'Strategically located in Boring Road, Patna, our venues offer easy access to major transportation hubs, hotels, and attractions. The prestigious location adds to the exclusivity of your event.'
              },
              {
                title: 'Flexible Event Suitability',
                desc: 'Our versatile venues seamlessly adapt to various event types—from traditional weddings and modern receptions to corporate conferences and intimate engagements. Each space can be customized to match your vision.'
              },
              {
                title: 'Comprehensive Facilities',
                desc: 'Every venue is equipped with modern amenities including climate control, premium lighting, sound systems, staging areas, and dedicated spaces for ceremonies, dining, and entertainment.'
              },
              {
                title: 'Customizable Decor Options',
                desc: 'Work with our expert design team to create bespoke decor that reflects your style. From traditional elegance to contemporary sophistication, we bring your vision to life with attention to every detail.'
              },
              {
                title: 'Guest Amenities',
                desc: 'We prioritize guest comfort with amenities including comfortable seating, climate-controlled environments, premium restroom facilities, and attentive service staff ensuring a memorable experience for all attendees.'
              },
              {
                title: 'Proven Excellence',
                desc: 'With years of experience hosting thousands of successful events, we have built a reputation for reliability, professionalism, and excellence. Our track record speaks to our commitment to making every event extraordinary.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[#0A0A0A] rounded-xl border-l-4 border-[#D4AF37]"
              >
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Gallery Intro Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6">
              Explore Our <span className="text-[#D4AF37] italic">Gallery</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Step into a world of elegance and sophistication. Our gallery showcases the beauty and versatility of our venues, 
              capturing moments from real celebrations. Each image tells a story of perfection, attention to detail, and the 
              joy of creating unforgettable memories. Browse through our collection to envision your event in these stunning spaces.
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors"
            >
              View Gallery
              <FiArrowRight />
            </Link>
          </motion.div>
        </section>

        {/* Packages Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-12 text-center">
              Event <span className="text-[#D4AF37] italic">Packages</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Wedding Package',
                  events: ['Weddings', 'Receptions', 'Engagements'],
                  features: ['Full venue access', 'Bridal suite', 'Decor setup', 'Catering options', 'Photography space', 'Sound system'],
                  price: 'Custom Pricing'
                },
                {
                  title: 'Corporate Package',
                  events: ['Conferences', 'Seminars', 'Meetings'],
                  features: ['AV equipment', 'Meeting rooms', 'WiFi access', 'Catering services', 'Projection screens', 'Business amenities'],
                  price: 'Custom Pricing'
                },
                {
                  title: 'Celebration Package',
                  events: ['Anniversaries', 'Birthdays', 'Family Events'],
                  features: ['Flexible layouts', 'Entertainment space', 'Catering options', 'Decor assistance', 'Photography setup', 'Guest amenities'],
                  price: 'Custom Pricing'
                }
              ].map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500"
                >
                  <h3 className="text-2xl font-bold mb-4 text-white">{pkg.title}</h3>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Perfect For</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.events.map((event, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <FiCheckCircle className="text-[#D4AF37] flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[#D4AF37] font-bold text-lg">{pkg.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

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
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.3 } }}
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

        {/* CTA Section */}
        <section className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-[#111] to-[#0A0A0A] border border-[#D4AF37]/30 rounded-3xl p-12 text-center"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6">
              Ready to Create <span className="text-[#D4AF37] italic">Memories?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto font-light">
              Let us help you find the perfect venue for your special occasion. Our team is here to guide you through every step, 
              ensuring your event exceeds expectations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book"
                className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors inline-flex items-center justify-center gap-2"
              >
                Book Your Venue
                <FiArrowRight />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
              >
                Contact Us
                <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default Halls;
