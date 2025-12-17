import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiMapPin, FiStar, FiShield, FiCheckCircle, 
  FiMail, FiPhone, FiUsers, FiClock, FiArrowLeft
} from 'react-icons/fi';
import api from '../utils/api';
import BookingModal from '../components/BookingModal';

const HallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [hall, setHall] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImage, setActiveImage] = useState(''); 
  
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Hall Details
        const hallResponse = await api.get(`/halls/${id}`);
        const hallData = hallResponse.data?.data || hallResponse.data;

        if (!hallData) {
          throw new Error('Venue data not found');
        }

        setHall(hallData);

        // Set initial active image from real data
        const imgs = (hallData.images || []).map(img => typeof img === 'string' ? img : (img?.url || img));
        if (imgs.length > 0) {
            setActiveImage(imgs[0]);
        } else {
            // Fallback placeholder if no images exist
            setActiveImage('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200');
        }

        // 2. Fetch Services (for booking modal)
        try {
            const serviceResponse = await api.get('/services');
            setServices(serviceResponse.data?.data || []);
        } catch (err) {
            console.error("Failed to load add-on services", err);
        }

      } catch (error) {
        console.error('Error fetching venue details:', error);
        toast.error('Venue not found or deleted');
        navigate('/halls'); // Redirect to listing page on error
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        fetchData();
    }
  }, [id, navigate]);

  // Loading State
  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-[#D4AF37] border-r-2 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error State (Double Check)
  if (!hall) return null;

  // Helper to normalize images
  const images = (hall.images || []).map(img => typeof img === 'string' ? img : (img?.url || img));

  return (
    <div className="bg-[#050505] text-white min-h-screen font-['Lato'] selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* === 1. IMMERSIVE HERO SECTION === */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* Back Button */}
        <Link to="/halls" className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:bg-[#D4AF37] hover:text-black transition-all text-sm font-bold uppercase tracking-widest border border-white/10">
           <FiArrowLeft /> Back to Venues
        </Link>

        {/* Parallax Background (Active Image) */}
        <motion.div 
            key={activeImage} 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ scale: heroScale, opacity: heroOpacity }} 
            className="absolute inset-0 z-0"
        >
           <img 
             src={activeImage} 
             alt={hall.name} 
             className="w-full h-full object-cover" 
             onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'} // Fallback
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
        </motion.div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10 flex flex-col justify-end h-full max-w-7xl mx-auto">
           <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-4 mb-4">
                 <span className="bg-[#D4AF37] text-black px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-[#D4AF37]/20">
                    <FiStar className="fill-black" /> Premium Venue
                 </span>
                 {hall.rating && (
                     <span className="flex items-center gap-1 text-white/80 text-sm backdrop-blur-md bg-white/10 px-3 py-1 rounded border border-white/10">
                        <FiStar className="text-[#D4AF37] fill-[#D4AF37]" /> {hall.rating} 
                        {hall.reviews ? ` (${hall.reviews} Reviews)` : ''}
                     </span>
                 )}
              </div>
              <h1 className="font-['Cinzel'] text-5xl md:text-8xl font-medium mb-4 text-white drop-shadow-2xl leading-tight">
                 {hall.name}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 flex items-center gap-2 font-light">
                 <FiMapPin className="text-[#D4AF37]" /> {hall.location}
              </p>
           </motion.div>
        </div>
      </div>

      {/* === 2. MAIN CONTENT GRID === */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-20 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Details & Gallery */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Gallery Strip (Clickable) */}
            {images.length > 0 && (
                <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Venue Gallery</h3>
                <div className="grid grid-cols-4 gap-4">
                    {images.slice(0, 4).map((img, i) => (
                        <div 
                            key={i} 
                            onClick={() => setActiveImage(img)}
                            className={`rounded-xl overflow-hidden h-24 md:h-32 border cursor-pointer transition-all duration-300 ${
                            activeImage === img 
                            ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                            : 'border-white/10 hover:border-[#D4AF37] opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                </div>
            )}

            {/* About Section */}
            <section>
               <h2 className="font-['Cinzel'] text-3xl text-white mb-6 flex items-center gap-4">
                  <span className="w-1 h-8 bg-[#D4AF37]"></span> About The Venue
               </h2>
               <p className="text-gray-300 text-lg leading-relaxed font-light">
                  {hall.description}
               </p>
            </section>

            {/* Facilities Grid */}
            <section>
               <h2 className="font-['Cinzel'] text-3xl text-white mb-8">Premium Amenities</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hall.facilities && hall.facilities.length > 0 ? (
                      hall.facilities.map((fac, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-[#111] border border-white/5 rounded-lg hover:border-[#D4AF37]/30 transition-all group">
                            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                            <FiCheckCircle />
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{fac}</span>
                        </div>
                      ))
                  ) : (
                      <p className="text-gray-500 italic">Amenities details available upon enquiry.</p>
                  )}
               </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="lg:col-span-4 relative">
             <div className="sticky top-24">
                
                {/* Booking Card */}
                <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                   
                   <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                      <div>
                         <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Starting Price</p>
                         <h3 className="text-3xl font-['Cinzel'] text-white">₹{hall.basePrice?.toLocaleString()}</h3>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-1 text-[#D4AF37] justify-end font-bold text-sm">
                            <FiStar className="fill-[#D4AF37]" /> {hall.rating || 'New'}
                         </div>
                         <p className="text-xs text-gray-500">Verified Listing</p>
                      </div>
                   </div>

                   {/* Quick Info */}
                   <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg">
                         <span className="flex items-center gap-2 text-gray-400"><FiUsers className="text-[#D4AF37]"/> Capacity</span>
                         <span className="font-bold text-white">{hall.capacity} Guests</span>
                      </div>
                      <div className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg">
                         <span className="flex items-center gap-2 text-gray-400"><FiClock className="text-[#D4AF37]"/> Duration</span>
                         <span className="font-bold text-white">Flexible Slots</span>
                      </div>
                      <div className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg">
                         <span className="flex items-center gap-2 text-gray-400"><FiShield className="text-[#D4AF37]"/> Cancellation</span>
                         <span className="font-bold text-green-400">Free till 48hrs</span>
                      </div>
                   </div>

                   {/* CTAs */}
                   <button 
                      onClick={() => setShowBookingModal(true)}
                      className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold uppercase tracking-widest text-sm rounded shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all mb-4"
                   >
                      Request Booking
                   </button>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <button className="py-3 border border-white/10 rounded text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                         <FiPhone /> Call Host
                      </button>
                      <button className="py-3 border border-white/10 rounded text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                         <FiMail /> Enquire
                      </button>
                   </div>
                   
                   <p className="text-center text-[10px] text-gray-600 mt-6">
                      *Prices may vary based on date & customization.
                   </p>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-[#111] py-3 rounded-lg border border-white/5">
                   <FiShield className="text-green-500" /> 100% Secure Booking Protection
                </div>

             </div>
          </div>

        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        hall={hall}
        services={services}
      />
    </div>
  );
};

export default HallDetail;




