import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiAward, FiHeart, FiUsers, FiArrowRight, FiShield, FiCoffee, FiStar, FiMapPin } from 'react-icons/fi';

// --- ASSETS ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80",
  story: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
  facilities: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
  experience: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
};

const About = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax Transforms
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1.1, 1]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">

      {/* === 0. PARTICLES === */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              color: { value: "#D4AF37" },
              move: { enable: true, speed: 0.2 },
              number: { value: 20 },
              opacity: { value: 0.3 },
              size: { value: 1 },
            }
          }}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* === 1. CINEMATIC HERO (Colorful) === */}
      <section className="relative h-screen flex items-end justify-start px-6 pb-20 overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 z-0">
          <img src={IMAGES.hero} alt="Luxury Hotel" className="w-full h-full object-cover opacity-80 transition-transform duration-[3s]" />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent" />
        </motion.div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full border-l border-[#D4AF37]/50 pl-8 md:pl-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
          >
            <span className="text-[#D4AF37] text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-6 block shadow-black drop-shadow-md">
              Welcome to
            </span>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white mb-6 leading-[0.9] drop-shadow-2xl">
              Lumiere <br/>
              <span className="italic font-light text-[#D4AF37]">Royale</span>
            </h1>
            <p className="text-white/90 text-lg md:text-2xl font-light max-w-xl leading-relaxed drop-shadow-lg">
              Patna's premier destination for luxury living. A sanctuary where modern architecture meets timeless Indian hospitality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* === 2. THE HOTEL STORY (Split Layout - Black) === */}
      <section className="py-32 px-6 relative z-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            
            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
               <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-8 block flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-[#D4AF37]"></span> About The Hotel
               </span>
               <h2 className="font-serif text-5xl md:text-6xl text-white mb-10 leading-tight">
                  An Icon in <br/><span className="text-gray-500 italic">Boring Road</span>
               </h2>
               <div className="space-y-8 text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                  <p>
                     Lumiere Royale is more than just a hotel; it is a landmark in Patna's most vibrant district. Designed by award-winning architects, our property stands as a beacon of sophistication amidst the city's energy.
                  </p>
                  <p>
                     We offer 50+ meticulously designed suites, a world-class rooftop lounge, and state-of-the-art wellness facilities. Whether you are here for business or leisure, Lumiere is your exclusive retreat from the ordinary.
                  </p>
               </div>
               
               {/* Stats Strip */}
               <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
                  <div>
                     <h4 className="text-4xl font-serif text-[#D4AF37]">50+</h4>
                     <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Suites</p>
                  </div>
                  <div>
                     <h4 className="text-4xl font-serif text-[#D4AF37]">24/7</h4>
                     <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Service</p>
                  </div>
                  <div>
                     <h4 className="text-4xl font-serif text-[#D4AF37]">4.9</h4>
                     <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Rating</p>
                  </div>
               </div>
            </motion.div>

            {/* Image Side (Updated Image) */}
            <motion.div 
               style={{ y: yParallax }}
               className="lg:w-1/2 relative"
            >
               <div className="relative h-[600px] w-full overflow-hidden">
                  <img src={IMAGES.story} alt="Story" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]" />
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* === 3. THE ROOMS & SUITES (Split Layout - White) === */}
      <section className="py-32 px-6 relative z-10 bg-white text-black mt-20 lg:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
            
            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
               <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-8 block flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-[#D4AF37]"></span> Accommodation
               </span>
               <h2 className="font-serif text-5xl md:text-6xl text-black mb-10 leading-tight">
                  Designed for <br/><span className="text-[#D4AF37] italic">Rest & Renewal</span>
               </h2>
               <div className="space-y-8 text-gray-600 text-lg md:text-xl font-light leading-relaxed">
                  <p>
                     Our accommodations range from Deluxe Rooms to the expansive Royal Suite. Each space features floor-to-ceiling windows, Italian marble bathrooms, and bespoke furnishings tailored for comfort.
                  </p>
                  <p>
                     Experience sleep like never before on our custom memory foam mattresses, and wake up to stunning views of the Patna skyline. Technology meets tranquility with our smart-room controls and high-speed connectivity.
                  </p>
               </div>
               
               <div className="mt-12">
                  <button className="group flex items-center gap-4 text-black uppercase tracking-[0.2em] text-xs font-bold hover:text-[#D4AF37] transition-colors">
                     View All Rooms 
                     <span className="w-12 h-[1px] bg-black group-hover:bg-[#D4AF37] transition-colors"></span>
                     <FiArrowRight className="group-hover:translate-x-2 transition-transform"/>
                  </button>
               </div>
            </motion.div>

            {/* Image Side */}
            <motion.div className="lg:w-1/2 relative group">
               <div className="h-[700px] w-full overflow-hidden relative">
                  <img src={IMAGES.experience} alt="Experience" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                  <div className="absolute inset-0 border-[20px] border-white/0 group-hover:border-white/20 transition-all duration-700 pointer-events-none"></div>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* === 4. AMENITIES GRID (Black) === */}
      <section className="py-32 px-6 relative z-10 bg-[#0A0A0A]">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
               <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase block mb-4">Our Features</span>
               <h2 className="font-serif text-4xl md:text-6xl text-white">Unmatched <span className="italic text-gray-600">Amenities</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 border-t border-white/10 pt-16">
               {[
                  { icon: <FiStar />, title: "Concierge", desc: "Our 24/7 concierge team handles everything from travel arrangements to restaurant reservations." },
                  { icon: <FiCoffee />, title: "Fine Dining", desc: "Enjoy global cuisine at 'The Gilded Spoon', our signature restaurant featuring world-class chefs." },
                  { icon: <FiShield />, title: "Secure Parking", desc: "Ample, monitored underground parking is provided complimentary for all hotel guests." },
                  { icon: <FiHeart />, title: "Sky Spa", desc: "Relax at our rooftop spa offering Ayurvedic treatments and modern therapies." },
                  { icon: <FiUsers />, title: "Grand Ballroom", desc: "A pillar-less ballroom perfect for weddings and corporate events up to 500 guests." },
                  { icon: <FiAward />, title: "Business Center", desc: "High-tech meeting rooms and co-working spaces for the modern traveler." }
               ].map((item, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     className="group hover:-translate-y-2 transition-transform duration-500"
                  >
                     <div className="text-[#D4AF37] text-3xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                     <h3 className="font-serif text-2xl text-white mb-3">{item.title}</h3>
                     <p className="text-gray-500 font-light text-lg">{item.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* === 5. FINAL CTA (Editorial) === */}
      <section className="h-[80vh] relative flex items-center justify-center text-center overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img src={IMAGES.facilities} alt="Lobby" className="w-full h-full object-cover opacity-40 grayscale" />
            <div className="absolute inset-0 bg-black/60" />
         </div>

         <div className="relative z-10 max-w-4xl px-6">
            <h2 className="font-serif text-6xl md:text-8xl text-white mb-8 leading-none">
               Experience <br/><span className="italic text-[#D4AF37]">The Royal Life</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
               <a href="/book" className="px-12 py-5 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-colors">
                  Check Availability
               </a>
               <a href="/contact" className="px-12 py-5 border border-white text-white font-bold uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-colors">
                  Contact Us
               </a>
            </div>
         </div>
      </section>

    </div>
  );
};

export default About;






