import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowDown, FiCalendar, FiCompass } from 'react-icons/fi';

// --- Configuration ---
// Replace this URL with your actual image path
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop";

const HeroSection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={BACKGROUND_IMAGE} 
          alt="Luxury Event Background" 
          className="w-full h-full object-cover object-center"
        />
        {/* Premium Overlay: Dark at bottom matching Our Story section, transparent at top for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#0A0A0A]" />
        {/* Texture Overlay (Optional): Adds a bit of noise for a film look */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-center sm:px-6 lg:px-8">
        
        {/* Top Tagline */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 text-xs font-bold tracking-[0.3em] text-[#D4AF37] uppercase border border-[#D4AF37]/30 px-4 py-2 rounded-full backdrop-blur-md bg-black/20"
        >
          Est. 2024 • Premium Events
        </motion.span>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mb-6 font-serif text-5xl font-medium leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg"
        >
          Your Dream Event, <br />
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F8F1D1] to-[#D4AF37]">
            Perfectly Planned
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl mb-10 text-lg font-light leading-relaxed text-gray-200 sm:text-xl md:text-2xl"
        >
          We organize Weddings, Engagements, Anniversaries, Receptions, 
          Corporate Events & more with timeless elegance.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link 
            to="/halls"
            className="group px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black flex items-center gap-2 hover:scale-105"
          >
            <FiCalendar className="text-sm" />
            <span>Book Now</span>
          </Link>

          <Link 
            to="/services"
            className="group px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 flex items-center gap-2 hover:scale-105"
          >
            <FiCompass className="text-sm" />
            <span>Explore Services</span>
          </Link>
        </motion.div>
      </div>

      {/* 3. Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-400">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="p-2 border border-white/20 rounded-full text-white/80"
        >
          <FiArrowDown />
        </motion.div>
      </motion.div>

    </section>
  );
};

export default HeroSection;



