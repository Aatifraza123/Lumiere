import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, FiStar, FiUsers, FiClock, FiDollarSign, FiLayers, 
  FiMap, FiCamera, FiMusic, FiUserCheck, FiMail, FiDownload, FiCalendar,
  FiArrowLeft, FiHeart, FiBriefcase, FiGift
} from 'react-icons/fi';
import { BiDrink, BiRestaurant, BiParty } from 'react-icons/bi';
import api from '../utils/api';

// Helper function to get category icon
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

// Helper function to get feature icon
const getFeatureIcon = (featureName) => {
  const name = featureName.toLowerCase();
  if (name.includes('venue') || name.includes('location')) return <FiMap />;
  if (name.includes('decor') || name.includes('decoration')) return <FiStar />;
  if (name.includes('catering') || name.includes('food')) return <BiRestaurant />;
  if (name.includes('photography') || name.includes('photo')) return <FiCamera />;
  if (name.includes('music') || name.includes('entertainment')) return <FiMusic />;
  if (name.includes('av') || name.includes('audio')) return <FiLayers />;
  if (name.includes('makeup') || name.includes('styling')) return <FiUserCheck />;
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
        
        // Transform API data to match component structure
        const transformedService = {
          _id: serviceData._id,
          title: serviceData.title || serviceData.name,
          name: serviceData.name || serviceData.title,
          slug: serviceData.slug || (serviceData.title || serviceData.name).toLowerCase().replace(/\s+/g, '-'),
          description: serviceData.description || '',
          shortDescription: serviceData.description?.substring(0, 100) + '...' || '',
          category: serviceData.category || serviceData.type || 'other',
          image: {
            url: serviceData.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'
          },
          features: (serviceData.features || []).map(f => ({
            name: typeof f === 'string' ? f : f.name || f,
            description: typeof f === 'string' ? `${f} included in this service` : f.description || `${f.name} included`,
            icon: getFeatureIcon(typeof f === 'string' ? f : f.name || f)
          })),
          inclusions: serviceData.features || [],
          pricing: {
            startingFrom: serviceData.price || 0,
            priceNote: 'Price varies based on requirements and customization'
          },
          duration: 'Full Day (8-12 hours)',
          capacity: { min: 50, max: 1000 },
          isPopular: serviceData.isFeatured || false
        };
        
        setService(transformedService);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service details');
      // Navigate back to services page
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
            <p className="text-xl text-gray-300 max-w-2xl font-light">{service.shortDescription || service.description?.substring(0, 100) + '...'}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-10">
        
        {/* 2. DESCRIPTION & BROCHURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-8">
             <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-12 h-[1px] bg-[#D4AF37]" /> The Experience
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {service.description}
              <br /><br />
              Our team specializes in creating bespoke experiences that reflect your unique style. From the initial concept to the final execution, we ensure every element is curated to perfection.
            </p>
            
            <div className="flex flex-wrap gap-4">
               <button 
                 onClick={() => navigate('/contact')}
                 className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#D4AF37] transition-colors flex items-center gap-2"
               >
                 <FiMail /> Enquire Now
               </button>
            </div>
          </div>

          {/* 3. INCLUSIONS LIST */}
          <div className="lg:col-span-4">
             <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <FiCheckCircle className="text-[#D4AF37]" /> What's Included
               </h3>
               <ul className="space-y-4">
                 {service.inclusions?.map((inc, i) => (
                   <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-2 shrink-0" />
                     {inc}
                   </li>
                 ))}
               </ul>
             </div>
          </div>
        </div>

        {/* 4. FEATURES GRID (Updated with Icons) */}
        <div className="mb-20">
           <h2 className="text-3xl font-bold mb-10 text-center">Curated Features</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features?.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:bg-white/5 transition-colors group cursor-default"
                >
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-3xl text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#D4AF37]/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#D4AF37] transition-colors">{feature.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceDetail;


