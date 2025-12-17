import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { FiArrowUpRight, FiMapPin, FiStar, FiPlay, FiUsers, FiInstagram, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import HeroSection from '../components/HeroSection';

// --- ASSETS ---
const ASSETS = {
  aboutImage: "https://images.unsplash.com/photo-1519225421980-715cb0202128?w=1600&q=80",
  videoMain: "https://cdn.coverr.co/videos/coverr-wedding-celebration-with-lights-2637/1080p.mp4",
  reel1: "https://cdn.coverr.co/videos/coverr-bride-and-groom-posing-in-the-sunset-4638/1080p.mp4",
  reel2: "https://cdn.coverr.co/videos/coverr-people-dancing-at-a-wedding-party-5452/1080p.mp4",
  reel3: "https://cdn.coverr.co/videos/coverr-slow-motion-of-sparklers-at-wedding-5136/1080p.mp4",
  services: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80"
  ]
};

const Home = () => {
  const [featuredHalls, setFeaturedHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        let response = await api.get('/halls?isFeatured=true&limit=3');
        let data = response.data?.data || response.data?.halls || response.data || [];
        
        if (data.length === 0) {
           const fallbackResponse = await api.get('/halls?isActive=true&limit=3');
           data = fallbackResponse.data?.data || fallbackResponse.data?.halls || fallbackResponse.data || [];
        }

        const formattedHalls = data.map(hall => ({
          _id: hall._id,
          name: hall.name,
          location: hall.location || 'Location on Request',
          price: hall.basePrice || hall.price || 'On Request',
          img: (hall.images && hall.images.length > 0) 
               ? (typeof hall.images[0] === 'string' ? hall.images[0] : hall.images[0].url) 
               : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
          rating: hall.rating || 5,
          type: hall.type || 'Luxury Venue'
        }));
        setFeaturedHalls(formattedHalls);
      } catch (err) {
        console.error("❌ Failed to fetch halls:", err);
        setFeaturedHalls([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  return (
    <div className="bg-[#050505] text-[#1a1a1a] font-['Montserrat'] overflow-x-hidden relative selection:bg-[#D4AF37] selection:text-black w-full">
      
      {/* GLOBAL SCROLL PROGRESS */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#D4AF37] z-[100] origin-left" style={{ scaleX }} />

      {/* GLOBAL NOISE */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-[90] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* --- SECTIONS --- */}
      
      <HeroSection />
      
      {/* 1. ABOUT (Cinematic Split) */}
      <AboutSection />
      
      {/* 2. THE ATELIER (Stats - NEW) */}
      <StatsSection />
      
      {/* 3. SERVICES (Dark Mode) */}
      <ServicesSection />
      
      {/* 4. CINEMATIC SHORTS (Video Reels - NEW) */}
      <CinematicReelsSection />
      
      {/* 5. FEATURED HALLS (Real Data) */}
      <FeaturedHallsSection halls={featuredHalls} loading={loading} />
      
      {/* 6. PROCESS (Timeline) */}
      <ProcessSection />
      
      {/* 7. VIDEO BREAK (Immersive) */}
      <VideoBreakSection />
      
      {/* 8. TESTIMONIALS */}
      <TestimonialsSection />
      
      {/* 9. CTA */}
      <CTASection />
      
    </div>
  );
};

// ==========================================
// 1. ABOUT SECTION
// ==========================================
const AboutSection = () => {
  return (
    <section className="py-32 px-6 bg-[#F9F8F4] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#f0efe9] -skew-x-12 transform translate-x-32 z-0"></div>
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}>
          <div className="flex items-center gap-4 mb-8">
            <span className="h-[1px] w-12 bg-[#D4AF37]"></span>
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase">Since 2010</span>
          </div>
          <h2 className="font-['Playfair_Display'] text-6xl md:text-7xl mb-8 leading-[1.1] text-[#050505]">
            Where Life <br />
            <span className="italic text-[#D4AF37]">Becomes Art.</span>
          </h2>
          <p className="text-[#555] text-lg leading-relaxed mb-8 font-light max-w-md">
            We don't just plan events; we orchestrate moments that suspend time. From intimate soirées to royal galas, Lumière is the architect of your most cherished memories.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} viewport={{ once: true }} className="relative">
          <div className="relative h-[600px] w-full overflow-hidden rounded-[2rem] shadow-2xl">
             <img src={ASSETS.aboutImage} alt="About" className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             <motion.div 
               initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
               className="absolute bottom-8 left-8 right-8 text-white"
             >
               <p className="font-['Playfair_Display'] italic text-2xl">"The details are not the details. They make the design."</p>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 2. STATS SECTION (The Atelier - NEW)
// ==========================================
const StatsSection = () => {
  const stats = [
    { label: "Celebrations", value: "1,200+" },
    { label: "Guest Experience", value: "500k+" },
    { label: "Global Cities", value: "15" },
    { label: "Design Awards", value: "24" },
  ];

  return (
    <section className="py-20 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h4 className="font-['Playfair_Display'] text-4xl md:text-6xl text-white mb-2">{stat.value}</h4>
              <p className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. SERVICES SECTION
// ==========================================
const ServicesSection = () => {
  const services = [
    { title: 'Royal Weddings', img: ASSETS.services[0], id: '01' },
    { title: 'Corporate Galas', img: ASSETS.services[1], id: '02' },
    { title: 'Private Soirées', img: ASSETS.services[2], id: '03' },
  ];

  return (
    <section className="bg-[#050505] text-white py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-20 border-b border-white/10 pb-8">
          <h2 className="font-['Playfair_Display'] text-5xl md:text-6xl">Our <span className="text-[#D4AF37] italic">Expertise</span></h2>
          <span className="hidden md:block text-gray-500 text-sm tracking-widest uppercase">Curated Experiences</span>
        </div>
        <div className="space-y-4">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative border-b border-white/10 pb-12 pt-4 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10 group-hover:translate-x-4 transition-transform duration-500">
                <div className="flex items-baseline gap-8">
                  <span className="text-[#D4AF37] font-['Playfair_Display'] text-2xl opacity-50">{service.id}</span>
                  <h3 className="text-4xl md:text-7xl font-light group-hover:text-[#D4AF37] transition-colors duration-500">{service.title}</h3>
                </div>
                <FiArrowUpRight className="text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[#D4AF37]" />
              </div>
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                <img src={service.img} className="w-full h-full object-cover grayscale" alt={service.title}/>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. CINEMATIC REELS SECTION (NEW)
// ==========================================
const CinematicReelsSection = () => {
  const reels = [
    { src: ASSETS.reel1, title: "The Union", loc: "Goa" },
    { src: ASSETS.reel2, title: "Midnight Gala", loc: "Mumbai" },
    { src: ASSETS.reel3, title: "Sparkle & Shine", loc: "Delhi" },
  ];

  return (
    <section className="py-32 bg-[#111] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
         <h2 className="font-['Playfair_Display'] text-4xl text-white">Captured <span className="text-[#D4AF37] italic">Moments</span></h2>
         <div className="flex gap-2 text-white items-center text-sm font-bold uppercase tracking-widest">
           <FiInstagram className="text-xl"/> @LumiereEvents
         </div>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-6">
         {reels.map((reel, i) => (
           <motion.div 
             key={i} 
             className="min-w-[300px] md:min-w-[350px] h-[600px] rounded-3xl overflow-hidden relative group cursor-pointer border border-white/10"
             whileHover={{ scale: 0.98 }}
           >
             <video 
               src={reel.src} 
               autoPlay loop muted playsInline 
               className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
             <div className="absolute bottom-8 left-8">
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-2">{reel.loc}</p>
                <h3 className="font-['Playfair_Display'] text-3xl text-white">{reel.title}</h3>
             </div>
             <div className="absolute top-8 right-8 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <FiPlay className="ml-1 text-sm"/>
             </div>
           </motion.div>
         ))}
      </div>
    </section>
  );
};

// ==========================================
// 5. FEATURED HALLS (Real Data)
// ==========================================
const FeaturedHallsSection = ({ halls, loading }) => {
  return (
    <section className="bg-[#fff] py-32 px-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="text-center mb-24">
           <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase">The Collection</span>
           <h2 className="font-['Playfair_Display'] text-5xl md:text-7xl text-black mt-4">Venues of <span className="italic text-[#D4AF37]">Distinction</span></h2>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center h-[400px]">
              <div className="w-16 h-16 border-t-2 border-[#D4AF37] rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400 text-sm uppercase tracking-widest">Curating Collection...</p>
           </div>
        ) : halls.length > 0 ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {halls.map((hall, i) => (
               <motion.div 
                 key={hall._id}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.2 }}
                 className={`group relative ${i === 1 ? 'lg:-mt-16' : ''}`}
               >
                 <div className="relative h-[600px] w-full overflow-hidden">
                   <img src={hall.img} alt={hall.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                   
                   <div className="absolute inset-0 p-8 flex flex-col justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <div className="flex justify-between items-start">
                       <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest">{hall.type}</span>
                       <span className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded"><FiStar className="fill-white"/> {hall.rating?.toFixed(1) || 5.0}</span>
                     </div>
                     <div>
                       <h3 className="font-['Playfair_Display'] text-4xl mb-2 leading-none">{hall.name}</h3>
                       <p className="flex items-center gap-2 text-sm uppercase tracking-widest opacity-80"><FiMapPin/> {hall.location}</p>
                       <div className="mt-6 pt-6 border-t border-white/30 flex justify-between items-end">
                         <div>
                            <span className="text-2xl font-serif">₹{typeof hall.price === 'number' ? hall.price.toLocaleString() : hall.price}</span>
                            <span className="text-[10px] block opacity-70">STARTING PRICE</span>
                         </div>
                         <Link to={`/halls/${hall._id}`} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                            <FiArrowUpRight/>
                         </Link>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-6 text-center group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="font-['Playfair_Display'] text-3xl text-black">{hall.name}</h3>
                    <p className="text-gray-500 text-sm uppercase tracking-widest mt-1">{hall.location}</p>
                 </div>
               </motion.div>
             ))}
           </div>
        ) : (
           <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 font-light text-xl">No curated venues available.</p>
           </div>
        )}
      </div>
    </section>
  );
};

// ==========================================
// 6. PROCESS SECTION
// ==========================================
const ProcessSection = () => {
  const steps = [
    { num: '01', title: 'Vision', desc: 'We begin with a blank canvas and your dreams.' },
    { num: '02', title: 'Design', desc: 'Sketching the blueprints of your celebration.' },
    { num: '03', title: 'Craft', desc: 'Sourcing the finest materials and talent.' },
    { num: '04', title: 'Reality', desc: 'The day arrives. Perfection is delivered.' },
  ];

  return (
    <section className="bg-[#F9F8F4] py-32 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
           <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-gray-300 z-0"></div>
           {steps.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2 }}
               className="relative z-10 pt-12 md:pt-0"
             >
               <div className="w-4 h-4 bg-[#D4AF37] rounded-full mb-6 mx-auto md:mx-0 relative z-10 outline outline-4 outline-[#F9F8F4]"></div>
               <span className="text-6xl text-gray-200 font-bold absolute top-0 right-0 -z-10">{step.num}</span>
               <h3 className="font-['Playfair_Display'] text-3xl mb-3 text-[#050505]">{step.title}</h3>
               <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 7. VIDEO BREAK SECTION
// ==========================================
const VideoBreakSection = () => {
  const [muted, setMuted] = useState(true);
  
  return (
    <section className="h-[80vh] w-full relative overflow-hidden flex items-center justify-center group">
      <video autoPlay loop muted={muted} playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={ASSETS.videoMain} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700"></div>
      
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
        <div className="w-24 h-24 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-8 cursor-pointer hover:scale-110 transition-transform duration-300">
           <FiPlay className="text-white text-3xl ml-2"/>
        </div>
        <h2 className="font-['Playfair_Display'] text-6xl text-white">The Lumière <span className="italic text-[#D4AF37]">Effect</span></h2>
      </motion.div>
      
      <button 
        onClick={() => setMuted(!muted)}
        className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-[#D4AF37] transition-colors z-20"
      >
         {muted ? <FiVolumeX/> : <FiVolume2/>}
      </button>
    </section>
  );
};

// ==========================================
// 8. TESTIMONIALS SECTION
// ==========================================
const TestimonialsSection = () => {
  return (
    <section className="bg-[#050505] text-white py-32 flex items-center justify-center text-center px-6">
      <div className="max-w-4xl">
         <FiUsers className="text-[#D4AF37] text-4xl mx-auto mb-8"/>
         <h2 className="font-['Playfair_Display'] text-3xl md:text-5xl leading-tight mb-12">
           "Lumière didn't just plan our wedding; they directed a masterpiece. The attention to detail was nothing short of poetic."
         </h2>
         <div className="flex flex-col items-center">
            <span className="font-bold uppercase tracking-[0.2em] text-sm text-[#D4AF37]">The Royal Family of Jaipur</span>
            <span className="text-gray-500 text-xs mt-2 uppercase">Udaipur Palace Wedding</span>
         </div>
      </div>
    </section>
  );
};

// ==========================================
// 9. CTA SECTION
// ==========================================
const CTASection = () => {
  return (
    <section className="h-[80vh] bg-[#F9F8F4] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4AF37]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 text-center px-6">
         <h2 className="font-['Playfair_Display'] text-6xl md:text-9xl text-[#050505] mb-8">
            Begin the <br/> <span className="italic text-[#D4AF37]">Extraordinary</span>
         </h2>
         <Link to="/contact" className="inline-block px-12 py-5 bg-[#050505] text-white font-bold uppercase tracking-[0.2em] text-sm hover:bg-[#D4AF37] hover:text-black transition-all shadow-2xl">
            Inquire Now
         </Link>
      </motion.div>
    </section>
  );
};

export default Home;







