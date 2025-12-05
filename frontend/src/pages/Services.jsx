import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { FiArrowRight, FiStar, FiSearch, FiCheckCircle } from 'react-icons/fi';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchServices(); }, []);
  useEffect(() => { filterServices(); }, [services, searchQuery]);

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
          category: service.category || service.type || 'other',
          image: {
            url: service.image?.url || service.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
          },
          features: service.features || [],
          isPopular: service.isFeatured || false
        }));
        setServices(transformedServices);
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
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    
    setFilteredServices(filtered);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black">
      
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
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Premium Services</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6">Our <span className="font-serif italic text-[#D4AF37]">Services</span></h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            At Lumiere, we provide exceptional hospitality and comprehensive event management services. 
            From luxurious room amenities to grand event planning, we ensure every detail is executed with precision.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none focus:bg-white/10 transition-all"
            />
          </div>
        </motion.div>

        {/* Key Services - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: <FiCheckCircle />, title: 'Hotel Services', text: 'Room services, hospitality, catering' },
            { icon: <FiCheckCircle />, title: 'Event Management', text: 'Weddings, corporate events, celebrations' },
            { icon: <FiCheckCircle />, title: 'Premium Amenities', text: 'Security, WiFi, valet parking' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111] border border-white/10 rounded-xl p-6 text-center"
            >
              <div className="text-3xl text-[#D4AF37] mb-3 flex justify-center">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredServices.map((service) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-500 cursor-pointer"
                onClick={() => navigate(`/services/${service._id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image?.url || service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                  {service.isPopular && (
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-black px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <FiStar className="fill-black text-xs" /> Popular
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{service.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-light">
                    {service.description}
                  </p>
                  <Link 
                    to={`/services/${service._id}`}
                    className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                  >
                    View Details <FiArrowRight />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Why Choose Us - Compact */}
        <section className="mb-16 bg-[#111] border border-white/10 rounded-3xl p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl mb-4">
              Why Choose <span className="text-[#D4AF37] italic">Lumiere</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Expert Team', desc: 'Experienced professionals with years of industry expertise' },
              { title: 'Personalized Care', desc: 'Services tailored to meet your unique needs' },
              { title: 'Quality Assurance', desc: 'Highest standards of quality in every service' },
              { title: '24/7 Support', desc: 'Round-the-clock assistance for all your needs' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-[#0A0A0A] rounded-xl border-l-4 border-[#D4AF37]"
              >
                <h3 className="text-base font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Simple CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8">Contact us to discuss your requirements</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors"
          >
            Contact Us
            <FiArrowRight />
          </Link>
        </motion.div>

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && services.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-2">No services found</h3>
            <p className="text-gray-400">Please check back later</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Services;
