import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiAward, FiHeart, FiUsers, FiArrowRight, FiShield, FiHome, FiCoffee, FiLock, FiStar, FiMapPin } from 'react-icons/fi';

// --- ASSETS ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  rooms: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  lobby: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80"
};

const About = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax & Opacity Transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const yStory = useTransform(scrollYProgress, [0.1, 0.4], [50, -50]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen font-['Lato'] overflow-x-hidden relative selection:bg-white selection:text-black">
      
      {/* === 0. SUBTLE PARTICLES (Clean & Minimal) === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            particles: {
              color: { value: "#ffffff" },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                enable: true,
                speed: 0.4,
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "out" },
              },
              number: { density: { enable: true, area: 800 }, value: 40 },
              opacity: { value: 0.2, animation: { enable: true, speed: 0.5, minimumValue: 0.1 } },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 2 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />
      </div>

      {/* === 1. HERO SECTION === */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex flex-col items-center justify-center px-6 z-10"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.hero} 
            alt="Hotel Lobby" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <span className="font-['Cinzel'] text-white/60 text-xs md:text-sm font-medium tracking-[0.6em] uppercase mb-6 block">
            Welcome to
          </span>
          
          <h1 className="font-['Cinzel'] text-6xl md:text-8xl lg:text-9xl font-medium mb-6 leading-none tracking-tight text-white">
            Lumiere
          </h1>

          <div className="flex items-center justify-center gap-2 text-gray-400 mb-8">
            <FiMapPin className="text-[#D4AF37]" />
            <span className="text-lg md:text-xl">Boring Road Patna</span>
          </div>

          <div className="h-[1px] w-24 bg-[#D4AF37]/50 mx-auto mb-8"></div>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Where comfort meets elegance, and every stay becomes a cherished memory. 
            Experience unparalleled hospitality in the heart of Boring Road Patna.
          </p>
        </motion.div>

        {/* Clean Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
        >
           <div className="w-[1px] h-24 bg-gradient-to-b from-white/50 to-transparent mx-auto"></div>
        </motion.div>
      </motion.section>

      {/* === 2. OUR STORY === */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-white/40 text-sm tracking-[0.3em] uppercase font-medium mb-4 block">Our Journey</span>
            <h2 className="font-['Cinzel'] text-4xl md:text-5xl text-white mb-6">
              The Story of <span className="text-[#D4AF37] italic font-serif">Lumiere</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6 text-white text-lg font-light leading-relaxed">
                <p>
                  Nestled in the vibrant heart of Boring Road Patna, Lumiere stands as a testament to 
                  timeless hospitality and modern luxury. What began as a vision to create a home away from 
                  home has evolved into a sanctuary where every guest is treated like family.
                </p>
                <p>
                  Our story is woven from countless moments of warmth, dedication, and an unwavering 
                  commitment to excellence. From the moment you step through our doors, you'll discover 
                  that we're not just a hotel—we're a destination where memories are made, business is 
                  conducted with ease, and families find their perfect retreat.
                </p>
                <p>
                  Over the years, we've hosted thousands of guests, each with unique needs and expectations. 
                  This diversity has shaped us into a hotel that seamlessly blends the comfort families 
                  seek with the efficiency business travelers demand.
                </p>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div 
              style={{ y: yStory }}
              className="relative h-[220px] w-full overflow-hidden rounded-lg"
            >
              <img 
                src={IMAGES.lobby} 
                alt="Hotel Lobby" 
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 hover:scale-105 transition-transform duration-[2s]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* === 3. MISSION & VALUES === */}
      <section className="py-32 px-6 relative z-10 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-['Cinzel'] text-3xl md:text-4xl text-white mb-4">Our Mission & Values</h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg font-light">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { 
                title: 'Our Mission', 
                icon: <FiStar />, 
                desc: 'To provide exceptional hospitality experiences that exceed expectations, creating lasting memories for every guest while maintaining the highest standards of service, comfort, and care.' 
              },
              { 
                title: 'Excellence', 
                icon: <FiAward />, 
                desc: 'We strive for perfection in every detail, from the cleanliness of our rooms to the quality of our cuisine, ensuring every aspect of your stay is flawless.' 
              },
              { 
                title: 'Genuine Care', 
                icon: <FiHeart />, 
                desc: 'Your comfort and satisfaction are our top priorities. We treat every guest with warmth, respect, and personalized attention that makes you feel truly valued.' 
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group p-8 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-[#D4AF37]/30 transition-all duration-500"
              >
                <div className="text-4xl text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="font-['Cinzel'] text-xl mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === 4. WHAT MAKES US UNIQUE === */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-white/40 text-sm tracking-[0.3em] uppercase font-medium mb-4 block">Why Choose Us</span>
            <h2 className="font-['Cinzel'] text-4xl md:text-5xl text-white mb-6">
              What Makes <span className="text-[#D4AF37] italic font-serif">Lumiere</span> Unique
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "Prime Location",
                desc: "Strategically located in Boring Road Patna, we offer easy access to business districts, shopping centers, and cultural attractions, making us the perfect base for both work and leisure."
              },
              {
                title: "Personalized Service",
                desc: "Our dedicated team goes above and beyond to understand your needs. Whether you're here for business or pleasure, we tailor our services to ensure your stay is exactly what you envision."
              },
              {
                title: "Modern Amenities",
                desc: "We've thoughtfully equipped our hotel with the latest technology and modern conveniences, ensuring you stay connected, comfortable, and productive throughout your visit."
              },
              {
                title: "Family-Friendly & Business-Ready",
                desc: "Our versatile spaces and services cater perfectly to families seeking comfort and fun, while also providing business travelers with everything they need for a successful trip."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="p-8 bg-[#0A0A0A] border-l-4 border-[#D4AF37] rounded-lg hover:bg-[#111] transition-colors"
              >
                <h3 className="font-['Cinzel'] text-2xl text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === 5. FACILITIES === */}
      <section className="py-32 px-6 relative z-10 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-white/40 text-sm tracking-[0.3em] uppercase font-medium mb-4 block">World-Class Facilities</span>
            <h2 className="font-['Cinzel'] text-4xl md:text-5xl text-white mb-6">
              Everything You Need for a <span className="text-[#D4AF37] italic font-serif">Perfect Stay</span>
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg font-light">
              We've carefully curated every facility to ensure your comfort, safety, and satisfaction
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FiHome />,
                title: "Luxurious Rooms",
                desc: "Spacious, elegantly designed rooms and suites featuring premium bedding, modern furnishings, and thoughtful amenities. Each room is a haven of comfort, equipped with high-speed Wi-Fi, climate control, and stunning views."
              },
              {
                icon: <FiCoffee />,
                title: "Exquisite Restaurant",
                desc: "Savor culinary excellence at our in-house restaurant, where our talented chefs craft delicious meals using the finest ingredients. From hearty breakfasts to gourmet dinners, every meal is a celebration of flavor."
              },
              {
                icon: <FiShield />,
                title: "Secure Parking",
                desc: "Travel with peace of mind knowing your vehicle is safe in our well-lit, 24/7 monitored parking facility. Ample space for cars, with easy access to the hotel entrance."
              },
              {
                icon: <FiLock />,
                title: "24/7 Security",
                desc: "Your safety is paramount. Our round-the-clock security team, advanced surveillance systems, and secure access controls ensure you and your belongings are always protected."
              },
              {
                icon: <FiStar />,
                title: "Impeccable Hygiene",
                desc: "We maintain the highest standards of cleanliness and sanitation. Our rigorous cleaning protocols, regular deep-cleaning sessions, and use of hospital-grade disinfectants guarantee a spotless environment."
              },
              {
                icon: <FiUsers />,
                title: "Exceptional Staff",
                desc: "Our professional, courteous, and well-trained team is always ready to assist you. From the front desk to housekeeping, every staff member is committed to making your stay memorable."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-[#D4AF37]/50 hover:bg-[#111] transition-all duration-500"
              >
                <div className="text-5xl text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="font-['Cinzel'] text-xl mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === 6. GUEST EXPERIENCE === */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] w-full overflow-hidden rounded-lg"
            >
              <img 
                src={IMAGES.rooms} 
                alt="Luxurious Room" 
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 hover:scale-105 transition-transform duration-[2s]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-white/40 text-sm tracking-[0.3em] uppercase font-medium mb-4 block">Your Experience</span>
              <h2 className="font-['Cinzel'] text-4xl md:text-5xl text-white mb-8">
                A Stay That <span className="text-[#D4AF37] italic font-serif">Exceeds Expectations</span>
              </h2>
              
              <div className="space-y-6 text-gray-300 text-lg font-light leading-relaxed">
                <p>
                  At Lumiere, we believe that exceptional hospitality is about creating moments that matter. 
                  Whether you're traveling for business or leisure, with family or solo, we ensure every aspect 
                  of your stay is thoughtfully considered.
                </p>
                <p>
                  Our commitment to guest experience means we're constantly evolving. We listen to your feedback, 
                  anticipate your needs, and go the extra mile to make your time with us truly special. From the 
                  moment you make your reservation to the time you check out, we're here to ensure your comfort 
                  and satisfaction.
                </p>
                <p>
                  Join thousands of satisfied guests who have made Lumiere their preferred choice in Boring Road Patna. 
                  Experience the difference that genuine care, attention to detail, and unwavering commitment to excellence 
                  can make.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === 7. CTA SECTION === */}
      <section className="py-32 px-6 text-center relative z-10 bg-[#080808] border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <h2 className="font-['Cinzel'] text-4xl md:text-6xl mb-6 text-white">
            Experience <span className="text-[#D4AF37] italic font-serif">Lumiere</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 font-light">
            Book your stay today and discover why we're the preferred choice for travelers in Boring Road Patna
          </p>
          
          <a 
            href="/book" 
            className="group relative inline-flex items-center gap-4 px-8 py-4 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all duration-500 font-semibold"
          >
            <span className="uppercase tracking-widest text-sm">Book Your Stay</span>
            <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
          </a>
        </motion.div>
      </section>

    </div>
  );
};

export default About;
