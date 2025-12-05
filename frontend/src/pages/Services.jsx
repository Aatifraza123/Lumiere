import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FiArrowRight, FiStar, FiSearch, FiHeart, FiBriefcase, FiGift, FiCalendar, 
  FiUsers, FiCoffee, FiHome, FiShield, FiWifi, FiCheckCircle, FiAward
} from 'react-icons/fi';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchServices(); }, []);
  useEffect(() => { filterServices(); }, [services, selectedCategory, searchQuery]);

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
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    
    setFilteredServices(filtered);
  };

  // Service categories for display
  const hotelServices = [
    {
      title: 'Luxury Room Services',
      description: 'Experience unparalleled comfort with our premium room services including housekeeping, laundry, room service, and personalized concierge assistance.',
      icon: <FiHome />,
      features: ['24/7 Room Service', 'Housekeeping', 'Laundry Service', 'Concierge Assistance']
    },
    {
      title: 'Premium Hospitality',
      description: 'Our dedicated hospitality team ensures every guest receives personalized attention, from check-in to check-out, creating memorable experiences.',
      icon: <FiUsers />,
      features: ['Personalized Service', 'Guest Relations', 'Special Requests', 'VIP Treatment']
    },
    {
      title: 'In-House Catering',
      description: 'Savor exquisite culinary experiences with our in-house catering services, featuring diverse menus crafted by expert chefs using the finest ingredients.',
      icon: <FiCoffee />,
      features: ['Multi-Cuisine Options', 'Custom Menus', 'Dietary Accommodations', 'Banquet Services']
    }
  ];

  const eventServices = [
    {
      title: 'Wedding Planning & Management',
      description: 'Complete wedding planning services from venue selection to execution, ensuring your special day is flawless and unforgettable.',
      icon: <FiHeart />,
      features: ['Venue Coordination', 'Decor & Design', 'Vendor Management', 'Day-of Coordination']
    },
    {
      title: 'Corporate Event Management',
      description: 'Professional corporate event solutions including conferences, seminars, product launches, and team building activities.',
      icon: <FiBriefcase />,
      features: ['AV Equipment Setup', 'Meeting Facilities', 'Networking Spaces', 'Business Catering']
    },
    {
      title: 'Celebration Services',
      description: 'Make every celebration special with our comprehensive event services for birthdays, anniversaries, engagements, and family gatherings.',
      icon: <FiGift />,
      features: ['Theme Planning', 'Entertainment Arrangements', 'Photography Setup', 'Custom Decor']
    }
  ];

  const premiumServices = [
    {
      title: '24/7 Security & Safety',
      description: 'Your safety is our priority. Round-the-clock security surveillance, secure access controls, and emergency response systems.',
      icon: <FiShield />,
      features: ['Security Surveillance', 'Access Control', 'Emergency Response', 'Guest Safety']
    },
    {
      title: 'High-Speed Connectivity',
      description: 'Stay connected with complimentary high-speed WiFi throughout the property, ensuring seamless communication and productivity.',
      icon: <FiWifi />,
      features: ['High-Speed WiFi', 'Business Center', 'Meeting Room Facilities', 'Tech Support']
    },
    {
      title: 'Premium Amenities',
      description: 'Enjoy world-class amenities including valet parking, spa services, fitness facilities, and exclusive access to premium spaces.',
      icon: <FiAward />,
      features: ['Valet Parking', 'Spa Services', 'Fitness Center', 'Premium Lounges']
    }
  ];

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
            At Lumiere, we are committed to providing exceptional hospitality and comprehensive event management services. 
            From luxurious room amenities to grand event planning, we ensure every detail is executed with precision and care.
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

        {/* Hotel Services Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6 text-center">
              Hotel <span className="text-[#D4AF37] italic">Services</span>
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12 font-light">
              Experience world-class hospitality with our comprehensive hotel services designed for your comfort and convenience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotelServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500"
              >
                <div className="text-5xl text-[#D4AF37] mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                <p className="text-gray-400 mb-6 font-light leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <FiCheckCircle className="text-[#D4AF37] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Event Services Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6 text-center">
              Event <span className="text-[#D4AF37] italic">Services</span>
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12 font-light">
              From intimate gatherings to grand celebrations, our expert event management team brings your vision to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {eventServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500"
              >
                <div className="text-5xl text-[#D4AF37] mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                <p className="text-gray-400 mb-6 font-light leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <FiCheckCircle className="text-[#D4AF37] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Premium Services Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6 text-center">
              Premium <span className="text-[#D4AF37] italic">Services</span>
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12 font-light">
              Enhance your stay with our premium amenities and services designed for discerning guests.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {premiumServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500"
              >
                <div className="text-5xl text-[#D4AF37] mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                <p className="text-gray-400 mb-6 font-light leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <FiCheckCircle className="text-[#D4AF37] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Services Grid (Dynamic from API) */}
        {filteredServices.length > 0 && (
          <section className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl mb-6 text-center">
                All <span className="text-[#D4AF37] italic">Services</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          </section>
        )}

        {/* Why Choose Us Section */}
        <section className="mb-24 bg-[#111] border border-white/10 rounded-3xl p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6">
              Why Choose <span className="text-[#D4AF37] italic">Lumiere</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto font-light">
              Discover what sets us apart in delivering exceptional service experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Expert Team',
                desc: 'Our experienced professionals bring years of industry expertise to every service we provide.'
              },
              {
                title: 'Personalized Care',
                desc: 'We tailor our services to meet your unique needs, ensuring a customized experience.'
              },
              {
                title: 'Quality Assurance',
                desc: 'We maintain the highest standards of quality in every aspect of our service delivery.'
              },
              {
                title: '24/7 Support',
                desc: 'Round-the-clock assistance ensures your needs are met whenever you require our services.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[#0A0A0A] rounded-xl border-l-4 border-[#D4AF37]"
              >
                <h3 className="text-lg font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-[#111] to-[#0A0A0A] border border-[#D4AF37]/30 rounded-3xl p-12 text-center"
          >
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6">
              Ready to Experience <span className="text-[#D4AF37] italic">Excellence?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto font-light">
              Contact us today to discuss your requirements and discover how we can make your event or stay truly exceptional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors inline-flex items-center justify-center gap-2"
              >
                Contact Us
                <FiArrowRight />
              </Link>
              <Link
                to="/book"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
              >
                Book Now
                <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </section>

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
