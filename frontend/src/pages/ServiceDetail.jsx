import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, FiStar, FiUsers, FiClock, FiArrowLeft, FiMail, FiPhone,
  FiMapPin, FiCamera, FiMusic, FiLayers, FiUserCheck, FiHeart, FiBriefcase,
  FiGift, FiCalendar, FiHome, FiShield, FiWifi, FiInfo, FiChevronRight, FiCheck
} from 'react-icons/fi';
import { BiRestaurant, BiParty } from 'react-icons/bi';
import api from '../utils/api';

// --- HELPER: Safe Image Extraction ---
const getServiceImage = (serviceData) => {
    if (!serviceData) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200"; 
    if (serviceData.image && typeof serviceData.image === 'object' && serviceData.image.url) return serviceData.image.url;
    if (serviceData.image && typeof serviceData.image === 'string') return serviceData.image;
    return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200";
};

const getCategoryIcon = (category) => {
  const iconMap = {
    wedding: <FiHeart />,
    corporate: <FiBriefcase />,
    party: <BiParty />,
    anniversary: <FiGift />,
    engagement: <FiUsers />,
    other: <FiCalendar />
  };
  return iconMap[category?.toLowerCase()] || <FiLayers />;
};

const getFeatureIcon = (featureName) => {
  const name = featureName.toLowerCase();
  if (name.includes('venue') || name.includes('location')) return <FiMapPin />;
  if (name.includes('decor')) return <FiStar />;
  if (name.includes('catering') || name.includes('food')) return <BiRestaurant />;
  if (name.includes('photo')) return <FiCamera />;
  if (name.includes('music')) return <FiMusic />;
  if (name.includes('av') || name.includes('audio')) return <FiLayers />;
  if (name.includes('makeup')) return <FiUserCheck />;
  if (name.includes('room')) return <FiHome />;
  if (name.includes('security')) return <FiShield />;
  if (name.includes('wifi')) return <FiWifi />;
  return <FiCheckCircle />;
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      if (response.data?.data) {
        const serviceData = response.data.data;
        const transformedService = {
          _id: serviceData._id,
          title: serviceData.title || serviceData.name,
          slug: serviceData.slug || (serviceData.title || serviceData.name).toLowerCase().replace(/\s+/g, '-'),
          description: serviceData.description || '',
          category: serviceData.category || serviceData.type || 'General',
          image: getServiceImage(serviceData), 
          features: (serviceData.features || []).map(f => ({
            name: typeof f === 'string' ? f : f.name,
            description: typeof f === 'string' ? `${f} included` : f.description,
            icon: getFeatureIcon(typeof f === 'string' ? f : f.name)
          })),
          inclusions: serviceData.features || [],
          isPopular: serviceData.isFeatured || false,
          priceRange: serviceData.priceRange || "Custom Pricing"
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

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#D4AF37]"></div></div>;
  if (!service) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Lato'] relative selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* === 1. HERO SECTION === */}
      <div className="relative h-[65vh] w-full">
        <div className="absolute inset-0 z-0">
            <img src={service.image} alt={service.title} className="w-full h-full object-cover brightness-[0.4]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto flex flex-col justify-end h-full z-10">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4AF37] mb-6 transition-colors text-xs font-bold uppercase tracking-widest">
             <FiArrowLeft /> Back
          </Link>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
             {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
               {service.isPopular && (
                 <span className="bg-[#D4AF37] text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                   <FiStar className="fill-black" /> Signature
                 </span>
               )}
               <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                 {service.category}
               </span>
            </div>
            <h1 className="font-['Cinzel'] text-4xl md:text-6xl font-medium mb-4 leading-tight text-white drop-shadow-2xl">
              {service.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* === 2. MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-8">
            
            {/* Overview */}
            <div className="mb-16">
              <h2 className="font-['Cinzel'] text-2xl text-white mb-6">Overview</h2>
              <p className="text-lg text-gray-300 font-light leading-relaxed mb-6">
                {service.description || `Experience the finest ${service.title} service tailored to perfection.`}
              </p>
              <p className="text-gray-400 leading-relaxed font-normal">
                At Lumiere, we ensure that every detail of your {service.title} is handled with precision. Whether it's a grand celebration or an intimate gathering, we set the stage for unforgettable memories.
              </p>
            </div>

            {/* Inclusions List */}
            <div className="mb-20">
              <h2 className="font-['Cinzel'] text-2xl text-white mb-8 flex items-center gap-3">
                 <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span> What's Included
              </h2>
              
              <div className="flex flex-col">
                {service.features.length > 0 ? service.features.map((feature, i) => (
                  <div key={i} className="group flex items-start md:items-center gap-6 py-6 border-b border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full border border-white/20 flex items-center justify-center text-gray-400 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-all bg-[#0A0A0A]">
                      {feature.icon}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-white text-lg font-medium mb-1 group-hover:text-[#D4AF37] transition-colors">
                        {feature.name}
                      </h4>
                      <p className="text-sm text-gray-500 font-normal leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">
                        <FiCheckCircle size={20} />
                    </div>
                  </div>
                )) : (
                   <p className="text-gray-500 italic">Custom inclusions available upon request.</p>
                )}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="pt-10 border-t border-white/10">
               <h2 className="font-['Cinzel'] text-2xl text-white mb-10">Why Choose Us</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                 {[
                   { title: "Expert Execution", desc: "Flawless planning and execution by industry veterans." },
                   { title: "Personalized Care", desc: "Tailored specifically to your unique preferences." },
                   { title: "Premium Quality", desc: "Only the finest resources and amenities used." },
                   { title: "24/7 Support", desc: "Round-the-clock assistance for peace of mind." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-[2px] h-full bg-gradient-to-b from-[#D4AF37] to-transparent min-h-[50px]"></div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* RIGHT: STICKY SIDEBAR (Glass Card) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28">
              
              {/* Glassmorphism Booking Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]">
                
                {/* Details Section (Now First) */}
                <div className="space-y-6 mb-8">
                   <div className="flex justify-between items-center text-sm text-gray-300">
                      <span className="flex items-center gap-2"><FiClock className="text-[#D4AF37]"/> Duration</span>
                      <span className="font-bold text-white">Flexible</span>
                   </div>
                   <div className="flex justify-between items-center text-sm text-gray-300">
                      <span className="flex items-center gap-2"><FiUsers className="text-[#D4AF37]"/> Guests</span>
                      <span className="font-bold text-white">Unlimited</span>
                   </div>
                   <div className="flex justify-between items-center text-sm text-gray-300">
                      <span className="flex items-center gap-2"><FiCheck className="text-[#D4AF37]"/> Availability</span>
                      <span className="font-bold text-[#4ade80]">Available</span>
                   </div>
                </div>

                {/* Price Section (Now moved below details) */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center mb-8">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Estimate Price</p>
                    <span className="text-[#D4AF37] text-4xl font-['Cinzel'] font-bold block">
                        {service.priceRange.includes('$') || service.priceRange.includes('₹') ? '' : '₹'}
                        {service.priceRange}
                    </span>
                </div>

                {/* Buttons */}
                <button 
                    onClick={() => navigate('/book')}
                    className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-sm rounded hover:bg-[#c5a028] transition-all mb-4 shadow-lg shadow-[#D4AF37]/20"
                >
                    Book Now
                </button>
                <button 
                    onClick={() => navigate('/contact')}
                    className="w-full py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded hover:bg-white/5 transition-colors"
                >
                    Enquire
                </button>
              </div>

              {/* Simple Contact Link */}
              <div className="mt-8 text-center">
                 <p className="text-gray-500 text-xs mb-2">Prefer to talk?</p>
                 <a href="tel:+911234567890" className="text-white hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2">
                    <FiPhone /> +91 123 456 7890
                 </a>
              </div>

            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default ServiceDetail;




