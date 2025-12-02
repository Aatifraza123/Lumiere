import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const Logo = () => {
  return (
    <Link to="/" className="group relative flex items-center gap-3 z-50 cursor-pointer select-none">
      
      {/* --- ICON CONTAINER --- */}
      <div className="relative">
        {/* Ambient Glow (Behind) */}
        <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="relative w-12 h-12 bg-gradient-to-br from-[#FBF5B7] via-[#BF953F] to-[#B38728] rounded-full flex items-center justify-center shadow-lg border border-white/10 overflow-hidden"
        >
          {/* Metallic Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Letter */}
          <span className="relative z-10 font-['Playfair_Display'] font-black text-2xl text-[#1a1a1a] mt-0.5 ml-0.5">
            L
          </span>
          
          {/* Floating Star (Animated) */}
          <motion.div
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 45, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-2 right-2.5 z-20"
          >
            <FiStar size={8} className="fill-white text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
          </motion.div>
        </motion.div>
      </div>

      {/* --- TEXT CONTAINER --- */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline">
          <span className="font-['Playfair_Display'] text-2xl font-bold text-white tracking-tight leading-none group-hover:text-[#FBF5B7] transition-colors duration-300">
            Lumière
          </span>
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            whileHover={{ width: 6, opacity: 1 }}
            className="h-1.5 bg-[#D4AF37] rounded-full ml-1"
          />
        </div>
        
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-[1px] w-3 bg-white/20 group-hover:w-6 group-hover:bg-[#D4AF37] transition-all duration-500" />
          <span className="text-[9px] font-['Montserrat'] font-medium tracking-[0.25em] text-white/60 uppercase group-hover:text-[#D4AF37] transition-colors duration-300">
            Luxury Events
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;


