import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiAward, FiHeart, FiUsers, FiTarget, FiArrowRight } from 'react-icons/fi';

// --- ASSETS ---
const IMAGES = {
  founder: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80",
  story: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"
};

const About = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax & Opacity Transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const yStory = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen font-['Lato'] overflow-x-hidden relative selection:bg-[#D4AF37] selection:text-black">
      
      {/* === NEXT-LEVEL PARTICLES === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            particles: {
              color: { value: "#D4AF37" },
              links: {
                color: "#D4AF37",
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
              },
              move: {
                enable: true,
                speed: 0.6,
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "out" },
              },
              number: { density: { enable: true, area: 800 }, value: 60 },
              opacity: { value: 0.3, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 h-full w-full"
        />
        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505]" />
      </div>

      {/* === 1. CINEMATIC HERO SECTION === */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex flex-col items-center justify-center px-6 z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          <span className="font-['Cinzel'] text-[#D4AF37] text-sm md:text-base font-bold tracking-[0.5em] uppercase mb-8 block relative">
            Since 2010
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-[#D4AF37]/50"></span>
          </span>
          
          <h1 className="font-['Cinzel'] text-5xl md:text-8xl lg:text-9xl font-medium mb-8 leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
            Beyond <br /> 
            <span className="italic font-serif text-[#D4AF37]">Expectation</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            We architect moments that linger in memory long after the lights dim.
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-['Cinzel']">Explore</span>
        </motion.div>
      </motion.section>

      {/* === 2. IMMERSIVE STORY SECTION === */}
      <section className="py-32 px-6 relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Parallax Image Container */}
          <motion.div 
            style={{ y: yStory }}
            className="relative h-[700px] w-full rounded-[20px] overflow-hidden border border-white/10"
          >
            <img 
              src={IMAGES.story} 
              alt="Our Story" 
              className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
               <div className="text-6xl text-[#D4AF37] font-['Cinzel'] mb-2">15+</div>
               <div className="text-sm uppercase tracking-[0.2em]">Years of Excellence</div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-['Cinzel'] text-4xl md:text-6xl mb-10 leading-tight">
              The Art of <br />
              <span className="text-[#D4AF37] italic">Perfection</span>
            </h2>
            <div className="space-y-8 text-gray-400 text-lg font-light leading-relaxed">
              <p>
                Lumière began as a whisper—a desire to bring cinematic grandeur to personal celebrations. 
                What started in a small studio has blossomed into an international collective of designers, 
                planners, and dreamers.
              </p>
              <p>
                We don't just coordinate vendors; we conduct symphonies. From the precise timing of a 
                spotlight to the texture of a linen napkin, every element is a deliberate stroke on your canvas.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
               <div>
                 <h4 className="text-[#D4AF37] font-['Cinzel'] text-xl mb-2">Vision</h4>
                 <p className="text-sm text-gray-500">To redefine the boundaries of celebration.</p>
               </div>
               <div>
                 <h4 className="text-[#D4AF37] font-['Cinzel'] text-xl mb-2">Craft</h4>
                 <p className="text-sm text-gray-500">Uncompromising quality in every detail.</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === 3. PHILOSOPHY (Horizontal Scroll Feel) === */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Core Values</span>
            <h2 className="font-['Cinzel'] text-4xl md:text-6xl">Our Philosophy</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Precision', icon: <FiTarget />, desc: 'Accuracy is not an option, it is our baseline.' },
              { title: 'Empathy', icon: <FiHeart />, desc: 'We feel the pulse of your emotions.' },
              { title: 'Innovation', icon: <FiAward />, desc: 'Pioneering new standards in luxury.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -15, borderColor: 'rgba(212, 175, 55, 0.3)' }}
                className="group p-12 rounded-[2rem] bg-[#0A0A0A] border border-white/5 hover:bg-white/[0.02] transition-all duration-500"
              >
                <div className="text-4xl text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="font-['Cinzel'] text-2xl mb-4 group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === 4. GRANDEUR CTA === */}
      <section className="py-32 px-6 text-center relative z-10 overflow-hidden">
        {/* Animated Ring Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#D4AF37]/10 rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4AF37]/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h2 className="font-['Cinzel'] text-5xl md:text-7xl mb-8">Meet The Curators</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto font-light text-lg">
            The minds behind the magic. A collective of visionary planners and designers.
          </p>
          
          <button className="group relative inline-flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full font-['Cinzel'] font-bold tracking-wider overflow-hidden hover:bg-[#D4AF37] transition-colors duration-500">
            <span>View Our Team</span>
            <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </motion.div>
      </section>

    </div>
  );
};

export default About;





