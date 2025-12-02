import { motion } from 'framer-motion';

const Loader = ({ fullScreen = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} bg-[#050505] flex items-center justify-center z-[9999] overflow-hidden`}
    >
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* 1. Deep Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#101010] to-[#050505]" />
      
      {/* 2. Ambient Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

      {/* 3. Enhanced Floating Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.1, 0.9, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
            scale: [1, 0.9, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FFD700]/5 rounded-full blur-[120px]"
        />
        {/* Additional Orb for Depth */}
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 30, -30, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#C5A028]/8 rounded-full blur-[100px]"
        />
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4AF37] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        
        {/* CENTER PIECE: Logo & Rings */}
        <div className="relative">
          
          {/* Enhanced Spinning Outer Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-20px] border-2 border-[#D4AF37]/20 rounded-full border-t-transparent border-l-transparent"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-35px] border border-[#FFD700]/10 rounded-full border-b-transparent border-r-transparent"
          />
          {/* Third Ring for More Depth */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-50px] border border-[#D4AF37]/5 rounded-full border-t-transparent border-r-transparent"
          />

          {/* Enhanced Logo Circle with Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 0,
              boxShadow: [
                '0 0 50px rgba(212, 175, 55, 0.4)',
                '0 0 80px rgba(212, 175, 55, 0.6)',
                '0 0 50px rgba(212, 175, 55, 0.4)',
              ]
            }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="relative w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FBF5B7] via-[#BF953F] to-[#B38728] border-2 border-white/20"
          >
             {/* Inner Ring with Animation */}
             <motion.div 
               className="absolute inset-2 rounded-full border-2 border-white/30"
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             />
             
             {/* Letter with Pulse */}
             <motion.span 
               initial={{ y: 5, opacity: 0, scale: 0 }}
               animate={{ 
                 y: 0, 
                 opacity: 1, 
                 scale: [1, 1.1, 1],
               }}
               transition={{ 
                 delay: 0.3, 
                 duration: 0.8,
                 scale: {
                   duration: 2,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }
               }}
               className="text-6xl font-['Playfair_Display'] font-black text-[#1a1a1a] relative z-10"
             >
               L
             </motion.span>

             {/* Enhanced Shine Effect */}
             <motion.div 
               className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none"
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             />
             
             {/* Outer Glow Pulse */}
             <motion.div
               className="absolute inset-[-10px] rounded-full bg-[#D4AF37]/20 blur-xl"
               animate={{
                 scale: [1, 1.3, 1],
                 opacity: [0.3, 0.6, 0.3],
               }}
               transition={{
                 duration: 2,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
             />
          </motion.div>
        </div>

        {/* Enhanced TEXT & PROGRESS */}
        <div className="flex flex-col items-center gap-4">
          <motion.h2
            initial={{ opacity: 0, letterSpacing: "0.1em", y: 20 }}
            animate={{ 
              opacity: 1, 
              letterSpacing: "0.2em",
              y: 0,
              textShadow: [
                '0 0 20px rgba(212, 175, 55, 0.3)',
                '0 0 40px rgba(212, 175, 55, 0.5)',
                '0 0 20px rgba(212, 175, 55, 0.3)',
              ]
            }}
            transition={{ 
              delay: 0.4, 
              duration: 0.8,
              textShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="text-3xl font-['Playfair_Display'] font-bold text-white tracking-wider"
          >
            LUMIÈRE
          </motion.h2>

          {/* Enhanced Loading Dots */}
          <div className="flex items-center gap-2 mb-2">
             {[0, 1, 2].map((i) => (
               <motion.div
                 key={i}
                 animate={{ 
                   opacity: [0.2, 1, 0.2],
                   scale: [1, 1.3, 1],
                   y: [0, -5, 0]
                 }}
                 transition={{ 
                   duration: 1.5, 
                   repeat: Infinity, 
                   delay: i * 0.2,
                   ease: "easeInOut"
                 }}
                 className="w-2 h-2 bg-[#D4AF37] rounded-full"
               />
             ))}
          </div>

          {/* Enhanced Progress Line */}
          <div className="w-56 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-1/2"
            />
            {/* Glow Effect on Progress */}
            <motion.div
              className="absolute inset-0 bg-[#D4AF37]/30 blur-sm"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
            className="text-xs text-gray-400 uppercase tracking-[0.3em] mt-2"
          >
            Loading Excellence
          </motion.p>
        </div>

      </div>

      {/* Additional Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]/30 pointer-events-none" />
    </motion.div>
  );
};

export default Loader;
