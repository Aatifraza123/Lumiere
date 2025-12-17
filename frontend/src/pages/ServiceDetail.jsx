import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, FiStar, FiUsers, FiClock, FiArrowLeft, FiMail, FiPhone,
  FiMapPin, FiCamera, FiMusic, FiLayers, FiUserCheck, FiHeart, FiBriefcase,
  FiGift, FiCalendar, FiHome, FiCoffee, FiShield, FiWifi, FiAward
} from 'react-icons/fi';
import { BiRestaurant, BiParty } from 'react-icons/bi';
import api from '../utils/api';

const getCategoryIcon = (category) => {
  const iconMap = {
    wedding: <FiHeart />,
    corporate: <FiBriefcase />,
    party: <BiParty />,
    anniversary: <FiGift />,
    engagement: <FiUsers />,
    other: <FiCalendar />
  };
  return iconMap[category] || <FiLayers />;
};

const getFeatureIcon = (featureName) => {
  const name = featureName.toLowerCase();
  if (name.includes('venue') || name.includes('location')) return <FiMapPin />;
  if (name.includes('decor') || name.includes('decoration')) return <FiStar />;
  if (name.includes('catering') || name.includes('food')) return <BiRestaurant />;
  if (name.includes('photography') || name.includes('photo')) return <FiCamera />;
  if (name.includes('music') || name.includes('entertainment')) return <FiMusic />;
  if (name.includes('av') || name.includes('audio')) return <FiLayers />;
  if (name.includes('makeup') || name.includes('styling')) return <FiUserCheck />;
  if (name.includes('room') || name.includes('accommodation')) return <FiHome />;
  if (name.includes('security') || name.includes('safety')) return <FiShield />;
  if (name.includes('wifi') || name.includes('connectivity')) return <FiWifi />;
  return <FiCheckCircle />;
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      if (response.data && response.data.data) {
        const serviceData = response.data.data;
        
        const transformedService = {
          _id: serviceData._id,
          title: serviceData.title || serviceData.name,
          name: serviceData.name || serviceData.title,
          slug: serviceData.slug || (serviceData.title || serviceData.name).toLowerCase().replace(/\s+/g, '-'),
          description: serviceData.description || '',
          category: serviceData.category || serviceData.type || 'other',
          image: {
            url: serviceData.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'
          },
          features: (serviceData.features || []).map(f => ({
            name: typeof f === 'string' ? f : f.name || f,
            description: typeof f === 'string' ? `${f} is included in this service package` : f.description || `${f.name} included`,
            icon: getFeatureIcon(typeof f === 'string' ? f : f.name || f)
          })),
          inclusions: serviceData.features || [],
          isPopular: serviceData.isFeatured || false
        };
        
        setService(transformedService);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service details');
      setTimeout(() => navigate('/services'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Service not found</p>
          <button 
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-full font-bold hover:bg-[#FFD700] transition-colors flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black pb-20">
      
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* HERO BANNER */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={service.image?.url || service.image} alt={service.title || service.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col items-center text-center z-20">
          {service.isPopular && (
            <span className="bg-[#D4AF37] text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiStar className="fill-black" /> Signature Service
            </span>
          )}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">{service.title || service.name}</h1>
          <p className="text-xl text-gray-300 max-w-2xl font-light">
            {service.description?.substring(0, 150) || 'Premium service designed to exceed your expectations'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/services')}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Back to Services
        </button>

        {/* Service Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-12 h-[1px] bg-[#D4AF37]" /> Service Overview
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                {service.description || `Our ${service.title} service is designed to provide you with an exceptional experience. We combine expertise, attention to detail, and personalized care to ensure every aspect meets your expectations.`}
              </p>
              <p>
                At Lumiere, we understand that exceptional service goes beyond meeting basic requirements. Our team of experienced professionals works diligently to create memorable experiences that reflect our commitment to excellence and your unique needs.
              </p>
              <p>
                Whether you're planning a special event, seeking premium hospitality services, or require comprehensive event management, we bring years of expertise and a passion for perfection to every project.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={() => navigate('/contact')}
                className="px-8 py-3 bg-[#D4AF37] text-black rounded-lg font-bold hover:bg-[#b5952f] transition-colors flex items-center gap-2"
              >
                <FiMail /> Enquire Now
              </button>
              <button 
                onClick={() => navigate('/book')}
                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <FiPhone /> Book Service
              </button>
            </div>
          </div>

          {/* Service Info Card */}
          <div className="lg:col-span-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiCheckCircle className="text-[#D4AF37]" /> Service Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl text-[#D4AF37]">
                    {getCategoryIcon(service.category)}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Category</div>
                    <div className="text-white font-semibold capitalize">{service.category}</div>
                  </div>
                </div>
                {service.isPopular && (
                  <div className="flex items-center gap-3">
                    <FiStar className="text-2xl text-[#D4AF37] fill-[#D4AF37]" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                      <div className="text-white font-semibold">Signature Service</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* What's Included */}
        {service.inclusions && service.inclusions.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.inclusions.map((inc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <FiCheckCircle className="text-[#D4AF37] flex-shrink-0" />
                  <span className="text-gray-300">{typeof inc === 'string' ? inc : inc.name || inc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose This Service */}
        <div className="mb-20 bg-[#0A0A0A] rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose This Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Expert Execution',
                desc: 'Our experienced team ensures flawless execution of every detail, bringing your vision to life with precision and professionalism.'
              },
              {
                title: 'Comprehensive Planning',
                desc: 'From initial consultation to final execution, we handle every aspect of planning and coordination, ensuring a seamless experience.'
              },
              {
                title: 'Personalized Approach',
                desc: 'We understand that every client is unique. Our services are tailored to meet your specific needs and preferences.'
              },
              {
                title: 'Quality Assurance',
                desc: 'We maintain the highest standards of quality in every service we provide, ensuring your complete satisfaction.'
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
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#111] to-[#0A0A0A] border border-[#D4AF37]/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto font-light">
            Contact us today to discuss your requirements and let us create an exceptional experience for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors inline-flex items-center justify-center gap-2"
            >
              <FiMail /> Contact Us
            </Link>
            <Link
              to="/book"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <FiPhone /> Book Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceDetail;
