import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useInView } from 'framer-motion';
import { FiArrowUpRight, FiMapPin, FiStar, FiPlay, FiCheckCircle, FiZap, FiAward, FiHeart, FiUsers, FiCalendar, FiClock, FiShield } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import HeroSection from '../components/HeroSection';

const ASSETS = {
  halls: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
    "https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200"
  ]
};

const VIDEO_BREAK_SOURCE = "https://cdn.coverr.co/videos/coverr-wedding-celebration-with-lights-2637/1080p.mp4";

const Home = () => {
  const [featuredHalls, setFeaturedHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    fetchFeaturedHalls();
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchFeaturedHalls = async () => {
    try {
      setLoading(true);
      console.log('📖 Fetching featured halls from API...');
      
      // First try to get featured halls
      let response = await api.get('/halls?isFeatured=true&isActive=true&limit=3');
      
      // Handle different response structures
      let hallsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          hallsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          hallsData = response.data.data;
        } else if (response.data.halls && Array.isArray(response.data.halls)) {
          hallsData = response.data.halls;
        }
      }
      
      // If no featured halls, try to get any active halls as fallback
      if (hallsData.length === 0) {
        try {
          response = await api.get('/halls?isActive=true&limit=3');
          if (response.data) {
            if (Array.isArray(response.data)) {
              hallsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              hallsData = response.data.data;
            } else if (response.data.halls && Array.isArray(response.data.halls)) {
              hallsData = response.data.halls;
            }
          }
        } catch (err) {
          console.log("Fallback fetch failed", err);
        }
      }
      
      // 1. Transform existing API data
      let displayedHalls = hallsData.slice(0, 3).map((hall, index) => ({
        _id: hall._id,
        name: hall.name || 'Unnamed Venue',
        location: hall.location || 'Location TBD',
        price: hall.basePrice || hall.price || 0,
        capacity: hall.capacity || 0,
        img: Array.isArray(hall.images) && hall.images.length > 0 
          ? (typeof hall.images[0] === 'string' ? hall.images[0] : (hall.images[0]?.url || hall.images[0]))
          : ASSETS.halls[index % ASSETS.halls.length],
        rating: hall.rating || 5,
        type: 'Luxury Venue'
      }));

      // 2. ADD 2 MORE MOCK VENUES IF NEEDED
      // This block ensures you always have at least 3 items
      if (displayedHalls.length < 3) {
        // Get deleted mock venues from localStorage
        const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
        
        const mockVenues = [
          {
            _id: 'royal-palace',
            name: 'The Royal Palace',
            location: 'Udaipur, Rajasthan',
            price: 250000,
            capacity: 800,
            img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200",
            rating: 4.9,
            type: 'Heritage Property'
          },
          {
            _id: 'grand-hyatt',
            name: 'Grand Hyatt Ballroom',
            location: 'Mumbai, Maharashtra',
            price: 180000,
            capacity: 500,
            img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
            rating: 4.8,
            type: 'Luxury Hotel'
          },
          {
            _id: 'seaside-center',
            name: 'Seaside Convention Center',
            location: 'Goa, India',
            price: 120000,
            capacity: 300,
            img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
            rating: 4.7,
            type: 'Beachside Resort'
          }
        ];

        // Filter out deleted mock venues
        const availableMockVenues = mockVenues.filter(
          venue => !deletedMockVenues.includes(venue._id)
        );

        // Fill the array until we have 3 items (only from available mock venues)
        let mockIndex = 0;
        while (displayedHalls.length < 3 && availableMockVenues.length > 0) {
          // Add a mock item with proper ID that matches HallDetail mock data
          const mockItem = availableMockVenues[mockIndex % availableMockVenues.length];
          displayedHalls.push(mockItem);
          mockIndex++;
        }
      }

      console.log('✅ Final halls to display:', displayedHalls);
      setFeaturedHalls(displayedHalls);

    } catch (error) {
      console.error('❌ Error fetching halls:', error);
       // If API fails completely, show available mock items so section isn't empty
       const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
       const allMockVenues = [
           {
             _id: 'royal-palace',
             name: 'The Royal Palace',
             location: 'Udaipur, Rajasthan',
             price: 250000,
             capacity: 800,
             img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200",
             rating: 4.9,
             type: 'Heritage Property'
           },
           {
             _id: 'grand-hyatt',
             name: 'Grand Hyatt Ballroom',
             location: 'Mumbai, Maharashtra',
             price: 180000,
             capacity: 500,
             img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
             rating: 4.8,
             type: 'Luxury Hotel'
           },
           {
             _id: 'seaside-center',
             name: 'Seaside Convention Center',
             location: 'Goa, India',
             price: 120000,
             capacity: 300,
             img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
             rating: 4.7,
             type: 'Beachside Resort'
           }
       ];
       // Filter out deleted mock venues
       const availableMockVenues = allMockVenues.filter(
         venue => !deletedMockVenues.includes(venue._id)
       );
       setFeaturedHalls(availableMockVenues);
    } finally {
      setLoading(false);
    }
  };

        


  return (
    <div className="bg-[#0A0A0A] text-white font-['Montserrat'] overflow-x-hidden relative selection:bg-[#D4AF37] selection:text-black" style={{ width: '100%', maxWidth: '100vw', margin: 0, padding: 0 }}>
      
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* CUSTOM CURSOR */}
      <MagneticCursor mouseX={mouseX} mouseY={mouseY} />

      {/* SECTIONS */}
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FeaturedHallsSection halls={featuredHalls} loading={loading} />
      <ProcessSection />
      <VideoBreakSection />
      <TestimonialsSection />
      <WhyChooseUsSection />
      <CTASection />
    </div>
  );
};



// ===== ABOUT SECTION =====
const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Our Story</span>
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] mb-6 leading-tight font-normal">
            Where Celebration <br />
            <span className="italic text-[#D4AF37]">Becomes Art</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-6 font-light">
            Founded in 2010, Lumière Events emerged from a simple philosophy: every celebration deserves to be extraordinary.
          </p>
          <p className="text-gray-400 text-base leading-relaxed font-light">
            We've orchestrated over 1,200 events across India — from intimate rooftop engagements to palace weddings hosting 2,000 guests.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative group"
        >
          <div className="relative h-[500px] rounded-3xl overflow-hidden">
            <img src={ASSETS.halls[0]} alt="About" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ===== SERVICES SECTION =====
const ServicesSection = () => {
  const services = [
    { 
      title: 'Royal Weddings', 
      desc: 'Opulent celebrations with traditional grandeur and modern elegance.',
      img: ASSETS.halls[0],
      features: ['Venue Selection', 'Décor Design', 'Catering', 'Photography']
    },
    { 
      title: 'Corporate Galas', 
      desc: 'Professional events that reflect your brand prestige.',
      img: ASSETS.halls[1],
      features: ['AV Production', 'Brand Integration', 'Guest Management']
    },
    { 
      title: 'Private Parties', 
      desc: 'Intimate celebrations designed for memories.',
      img: ASSETS.halls[2],
      features: ['Theme Design', 'Entertainment', 'Custom Menus']
    },
  ];

  return (
    <section className="py-32 px-6 bg-[#0F0F0F] relative">
      {/* Gradient overlay at top to match Our Story section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-['Playfair_Display'] text-[clamp(2.5rem,5vw,4rem)] mb-4 font-normal">
            Our <span className="italic text-[#D4AF37]">Expertise</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light">
            From concept to execution, we handle every detail with meticulous care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <TiltCard key={i} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TiltCard = ({ service, index }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      className="relative h-[550px] rounded-3xl overflow-hidden cursor-pointer transition-transform duration-200"
    >
      <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="font-['Playfair_Display'] text-3xl font-normal mb-3">{service.title}</h3>
        <p className="text-gray-300 text-sm mb-4 font-light">{service.desc}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {service.features.map((f, i) => (
            <span key={i} className="text-xs px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              {f}
            </span>
          ))}
        </div>
        <Link to="/services" className="flex items-center gap-2 text-[#D4AF37] font-medium text-sm hover:gap-3 transition-all">
          Learn More <FiArrowUpRight />
        </Link>
      </div>
    </motion.div>
  );
};

// ===== FEATURED HALLS (WHITE BG) =====
const FeaturedHallsSection = ({ halls, loading }) => {
  // Debug logging
  console.log('🏛️ FeaturedHallsSection - halls:', halls);
  console.log('🏛️ FeaturedHallsSection - loading:', loading);
  console.log('🏛️ FeaturedHallsSection - halls length:', halls?.length);
  console.log('🏛️ FeaturedHallsSection - halls type:', typeof halls);
  console.log('🏛️ FeaturedHallsSection - is array?', Array.isArray(halls));
  
  // Ensure we have at least 3 halls, show first 3
  const displayHalls = halls && Array.isArray(halls) ? halls.slice(0, 3) : [];
  console.log('🏛️ Display halls (first 3):', displayHalls);
  console.log('🏛️ Display halls count:', displayHalls.length);
  
  // Always render the section, even if empty (for debugging)
  return (
    <section className="pt-12 pb-20 px-6 bg-white text-black relative z-10 overflow-visible">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:text-left"
        >
          <h2 className="font-['Playfair_Display'] text-[clamp(2.5rem,5vw,4rem)] mb-4 font-normal">
            Featured <span className="italic text-[#D4AF37]">Venues</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-xl font-light">
            Handpicked luxury destinations vetted for ambiance and service.
          </p>
          {displayHalls.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">Showing {displayHalls.length} of {halls?.length || 0} venues</p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="space-y-16 overflow-visible">
            {displayHalls.length > 0 ? (
              displayHalls.map((hall, i) => {
                console.log(`🏛️ Rendering hall ${i + 1}/${displayHalls.length}:`, hall);
                return (
                  <motion.div 
                    key={hall._id || `hall-${i}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative w-full"
                  >
                    <div className={`relative h-[350px] rounded-3xl overflow-hidden group ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <motion.img 
                        src={hall.img || ASSETS.halls[i % ASSETS.halls.length]} 
                        alt={hall.name || 'Venue'}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        onError={(e) => {
                          console.error('Image error for hall:', hall.name, e);
                          e.target.src = ASSETS.halls[i % ASSETS.halls.length];
                        }}
                      />
                      <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-1">
                          <FiStar className="fill-[#D4AF37] text-[#D4AF37]" /> {(hall.rating || 5).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className={`relative ${i % 2 === 1 ? 'lg:order-1' : ''} overflow-hidden`}>
                      <span className="absolute -top-16 left-0 md:-left-8 text-[100px] font-['Playfair_Display'] text-[#D4AF37] opacity-10 pointer-events-none" style={{ maxWidth: '100%' }}>
                        0{i + 1}
                      </span>
                      
                      <h3 className="font-['Playfair_Display'] text-3xl md:text-4xl mb-3 relative z-10 font-normal">{hall.name || 'Unnamed Venue'}</h3>
                      
                      <div className="flex items-center gap-2 text-[#D4AF37] mb-4 text-sm uppercase tracking-wide">
                        <FiMapPin /> {hall.location || 'Location TBD'}
                      </div>
                      
                      <p className="text-gray-600 text-base mb-6 leading-relaxed font-light">
                        An architectural masterpiece designed for {hall.capacity || 0} guests with state-of-the-art facilities.
                      </p>
                      
                      <div className="flex items-center gap-6 border-t border-black/10 pt-6">
                        <div>
                          <span className="block text-2xl font-bold">₹{hall.price || 0}</span>
                          <span className="text-xs text-gray-500 uppercase">Starting Price</span>
                        </div>
                        <MagneticButton>
                          <Link to={`/halls/${hall._id}`} className="px-6 py-3 border border-black/20 rounded-full hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white transition-all flex items-center gap-2 text-sm font-medium">
                            View Details <FiArrowUpRight />
                          </Link>
                        </MagneticButton>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600">No venues available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">Debug: Received {halls?.length || 0} halls</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// ===== PROCESS SECTION =====
const ProcessSection = () => {
  const steps = [
    { icon: <FiUsers />, title: 'Consultation', desc: 'We listen to your vision' },
    { icon: <FiCalendar />, title: 'Planning', desc: 'Detailed timeline creation' },
    { icon: <FiZap />, title: 'Execution', desc: 'Flawless event management' },
    { icon: <FiHeart />, title: 'Follow-up', desc: 'Post-event support' },
  ];

  return (
    <section className="py-32 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] mb-4 font-normal">
            Our <span className="italic text-[#D4AF37]">Process</span>
          </h2>
          <p className="text-gray-400 text-base font-light">Four steps to perfection</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:-translate-y-2 h-full">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-2xl text-[#D4AF37] mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm font-light">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== VIDEO BREAK =====
const VideoBreakSection = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Load video when component mounts
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoLoaded) {
            // Video is in view and loaded, play it
            if (videoRef.current) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    setIsPlaying(true);
                    console.log('Video playing');
                  })
                  .catch((error) => {
                    console.log('Video autoplay prevented:', error);
                    setIsPlaying(false);
                  });
              }
            }
          } else {
            // Video is out of view, pause it
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.2, // Play when 20% of video is visible
        rootMargin: '100px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [videoLoaded]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Play error:', error);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    console.log('Video loaded');
    
    // Try to play if section is in view
    if (sectionRef.current && videoRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Autoplay blocked:', error);
        });
      }
    }
  };

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-[#0F0F0F]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        className="max-w-7xl mx-auto h-[500px] rounded-3xl overflow-hidden relative group cursor-pointer"
        onClick={handlePlayClick}
      >
        {/* Fallback image - shown behind video */}
        <img 
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600" 
          className="w-full h-full object-cover absolute inset-0 z-0"
          alt="Video fallback"
        />
        
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover absolute inset-0 z-10"
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600"
          onCanPlay={handleVideoLoaded}
          onLoadedData={handleVideoLoaded}
          onLoadedMetadata={() => {
            console.log('Video metadata loaded');
            setVideoLoaded(true);
          }}
          onPlay={() => {
            console.log('Video playing');
            setIsPlaying(true);
          }}
          onPause={() => {
            console.log('Video paused');
            setIsPlaying(false);
          }}
          onError={(e) => {
            const video = e.target;
            if (video.error) {
              console.error('Video error code:', video.error.code);
              console.error('Video error message:', video.error.message);
            } else {
              console.error('Video failed to load');
            }
          }}
          onLoadStart={() => {
            console.log('Video load started');
          }}
        >
          <source src={VIDEO_BREAK_SOURCE} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay with Play/Pause Button */}
        <div className={`absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <motion.div 
            whileHover={{ scale: 1.2 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30"
          >
            {isPlaying ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-8 bg-white rounded"></div>
                <div className="w-2 h-8 bg-white rounded"></div>
              </div>
            ) : (
              <FiPlay className="w-8 h-8 text-white ml-1" />
            )}
          </motion.div>
        </div>

        {/* Text Overlay */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <h3 className="font-['Playfair_Display'] text-3xl md:text-5xl font-normal text-white mb-2">See Magic Unfold</h3>
          <p className="text-gray-200 text-sm md:text-base font-light">A visual journey through iconic celebrations</p>
        </div>
      </motion.div>
    </section>
  );
};

// ===== TESTIMONIALS =====
const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      console.log('📖 Fetching testimonials for website...');
      const response = await api.get('/testimonials?isApproved=true&isActive=true');
      console.log('📖 Testimonials API response:', response.data);
      
      const testimonialsData = response.data?.data || [];
      console.log(`📖 Found ${testimonialsData.length} approved and active testimonials`);
      
      if (testimonialsData.length > 0) {
        console.log('✅ Testimonials loaded from database');
        setTestimonials(testimonialsData);
      } else {
        console.warn('⚠️ No approved and active testimonials found in database');
        setTestimonials([]);
      }
    } catch (error) {
      console.error('❌ Error fetching testimonials:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no testimonials
  if (!loading && testimonials.length === 0) {
    return null; // Hide section if no testimonials
  }

  return (
    <section className="py-24 bg-[#0A0A0A] overflow-hidden">
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-['Playfair_Display'] text-center text-[clamp(2rem,5vw,3.5rem)] mb-16 font-normal"
      >
        Loved by <span className="text-[#D4AF37]">Thousands</span>
      </motion.h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            className="flex gap-8"
            style={{ willChange: 'transform' }}
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="min-w-[400px] bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating || 5)].map((_, si) => (
                  <FiStar key={si} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-gray-300 text-base mb-6 italic font-light leading-relaxed">"{t.message || t.text}"</p>
              <div className="flex items-center gap-3">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <span className="text-xs text-gray-500">{t.eventType || t.event}</span>
                </div>
              </div>
            </div>
          ))}
          </motion.div>
        </div>
      )}
    </section>
  );
};

// ===== WHY CHOOSE US =====
const WhyChooseUsSection = () => {
  const features = [
    { icon: <FiAward />, title: 'Award Winning', desc: '50+ industry recognitions' },
    { icon: <FiZap />, title: 'Fast Turnaround', desc: 'Events in 2 weeks' },
    { icon: <FiShield />, title: 'Full Insurance', desc: 'Comprehensive coverage' },
    { icon: <FiClock />, title: '24/7 Support', desc: 'Always available' },
  ];

  return (
    <section className="py-32 px-6 bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-['Playfair_Display'] text-[clamp(2.5rem,5vw,4rem)] text-center mb-16 font-normal"
        >
          Why <span className="italic text-[#D4AF37]">Lumière?</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="text-5xl mb-6 text-[#D4AF37]">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== CTA =====
const CTASection = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-40 px-6 bg-[#0A0A0A] relative overflow-hidden cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Advanced Custom Cursor Effect - Multiple Layers */}
      
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed pointer-events-none z-[300]"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: isHovering ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] opacity-40 blur-xl"></div>
      </motion.div>

      {/* Middle Pulsing Ring */}
      <motion.div
        className="fixed pointer-events-none z-[301]"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.4, 0, 0.4],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]"></div>
      </motion.div>

      {/* Golden Glow Dot */}
      <motion.div
        className="fixed pointer-events-none z-[302] mix-blend-difference"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: isHovering ? [1, 1.2, 1] : [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-12 h-12 rounded-full bg-[#D4AF37] opacity-90 blur-md" style={{
          background: 'radial-gradient(circle, #FFD700, #D4AF37, transparent)'
        }}></div>
      </motion.div>
      
      {/* White Center Dot */}
      <motion.div
        className="fixed pointer-events-none z-[303]"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: isHovering ? [1, 1.3, 1] : [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-6 h-6 rounded-full bg-white shadow-lg shadow-[#D4AF37]/50"></div>
      </motion.div>

      {/* Inner Glow */}
      <motion.div
        className="fixed pointer-events-none z-[304]"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <div className="w-8 h-8 rounded-full bg-[#D4AF37] opacity-60 blur-sm"></div>
      </motion.div>

      {/* Particle Trail Effect */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-[299]"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            x: [0, (i + 1) * 20 * (i % 2 === 0 ? 1 : -1)],
            y: [0, (i + 1) * 20 * (i % 2 === 0 ? -1 : 1)],
            opacity: [0.8, 0],
            scale: [1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        >
          <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
        </motion.div>
      ))}

      <motion.div 
        ref={textRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Heading with Stagger Animation */}
        <motion.h2 
          className="font-['Playfair_Display'] text-[clamp(2.5rem,6vw,5rem)] mb-6 font-normal leading-tight"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block"
          >
            Ready to create{' '}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="inline-block italic text-[#D4AF37]"
          >
            history?
          </motion.span>
        </motion.h2>
        
        {/* Description with Fade In */}
        <motion.p 
          className="text-base md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        >
          Let's make your celebration extraordinary.
        </motion.p>

        {/* START Button with Enhanced Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MagneticButton>
            <motion.button 
              className="inline-block text-5xl md:text-7xl font-['Playfair_Display'] font-normal text-white hover:text-[#D4AF37] transition-colors duration-500 relative"
              animate={{
                textShadow: [
                  "0 0 0px rgba(212, 175, 55, 0)",
                  "0 0 20px rgba(212, 175, 55, 0.5)",
                  "0 0 0px rgba(212, 175, 55, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              START
              {/* Glowing Underline Effect */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scaleX: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
              />
            </motion.button>
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ===== HELPER COMPONENTS =====

const MagneticCursor = ({ mouseX, mouseY }) => (
  <>
    <motion.div className="hidden md:block fixed w-2 h-2 bg-[#D4AF37] rounded-full pointer-events-none z-[200] top-0 left-0"
      style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }} />
    <motion.div className="hidden md:block fixed w-8 h-8 border border-[#D4AF37]/50 rounded-full pointer-events-none z-[200] top-0 left-0"
      style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }} />
  </>
);

const MagneticButton = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouse = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.2;
    const y = (clientY - top - height / 2) * 0.2;
    setPosition({ x, y });
  };
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => setPosition({ x: 0, y: 0 })} animate={{ x: position.x, y: position.y }} className="inline-block">
      {children}
    </motion.div>
  );
};

const GlassButton = ({ children }) => (
  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center px-6 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all text-sm font-medium">
    {children}
  </motion.button>
);

export default Home;



