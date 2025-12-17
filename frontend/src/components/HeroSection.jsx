import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowDown, FiCalendar, FiCompass, FiStar } from 'react-icons/fi';

// --- Configuration ---
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop";

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Parallax text
  const opacity = useTransform(scrollY, [0, 300], [1, 0]); // Fade out on scroll

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#050505]">
      
      {/* 1. DYNAMIC BACKGROUND (Ken Burns Effect) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          initial={{ scale: 1 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          src={BACKGROUND_IMAGE} 
          alt="Luxury Event" 
          className="w-full h-full object-cover object-center opacity-80"
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-80" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
      </div>

      {/* 2. MAIN CONTENT */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-center sm:px-6 lg:px-8"
      >
        
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/30 bg-[#000]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.1)]">
             <FiStar className="text-[#D4AF37] text-xs fill-[#D4AF37]" />
             <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-white uppercase">
               Est. 2024 • Premier Events
             </span>
             <FiStar className="text-[#D4AF37] text-xs fill-[#D4AF37]" />
          </div>
        </motion.div>

        {/* Headline with Staggered Reveal */}
        <h1 className="max-w-6xl mx-auto mb-6 font-serif text-5xl font-medium leading-[1.1] text-white sm:text-7xl md:text-8xl lg:text-9xl drop-shadow-2xl">
          <motion.span 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="block"
          >
            Your Dream Event,
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.4 }}
            className="block italic text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] via-[#F8E79C] to-[#B38B26] pb-4"
          >
            Perfectly Planned.
          </motion.span>
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="max-w-2xl mb-12 text-base md:text-xl font-light leading-relaxed text-gray-300/90 tracking-wide"
        >
          From royal weddings to intimate soirées, we orchestrate moments that suspend time and create grandeur.
        </motion.p>

        {/* Enhanced Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link 
            to="/halls"
            className="group relative px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book A Venue <FiCalendar />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          <Link 
            to="/services"
            className="group px-8 py-4 bg-transparent border border-white/30 text-white font-bold uppercase tracking-widest text-xs rounded-full backdrop-blur-sm hover:bg-white hover:text-black transition-all hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Our Services <FiCompass />
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* 3. SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 animate-pulse">Scroll</span>
      </motion.div>

    </section>
  );
};

export default HeroSection;




