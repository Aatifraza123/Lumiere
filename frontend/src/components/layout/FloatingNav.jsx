import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiInfo, FiBriefcase, FiMapPin, FiImage, FiBookOpen, FiMail } from 'react-icons/fi';
import Logo from './Logo';

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  // --- Only track if scrolled for background change (No hiding) ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const navLinks = [
    { path: '/', label: 'Home', icon: <FiHome /> },
    { path: '/about', label: 'About', icon: <FiInfo /> },
    { path: '/services', label: 'Services', icon: <FiBriefcase /> },
    { path: '/halls', label: 'Venues', icon: <FiMapPin /> },
    { path: '/gallery', label: 'Gallery', icon: <FiImage /> },
    { path: '/blog', label: 'Blog', icon: <FiBookOpen /> },
    { path: '/contact', label: 'Contact', icon: <FiMail /> }
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
          scrolled 
            ? 'py-2' 
            : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* --- LOGO --- */}
            <Logo />

            {/* --- DESKTOP NAV (Centered Pill) --- */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md px-2 py-2 rounded-full border border-white/10 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 group"
                >
                  {location.pathname === link.path ? (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#D4AF37] rounded-full z-[-1]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  ) : null}
                  
                  <span className={`flex items-center gap-2 ${
                    location.pathname === link.path ? 'text-black font-bold' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>


            {/* --- MOBILE TOGGLE --- */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10"
            >
              <AnimatePresence mode='wait'>
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <FiX size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <FiMenu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

          </div>
        </div>

        {/* --- MOBILE MENU FULLSCREEN --- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
              animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
              exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="fixed inset-0 bg-[#050505] z-40 md:hidden flex flex-col justify-center px-8"
            >
              {/* Background Elements */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="space-y-6 relative z-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 text-3xl font-['Playfair_Display'] ${
                        location.pathname === link.path ? 'text-[#D4AF37] italic' : 'text-white/50'
                      }`}
                    >
                      <span className="text-xl">{link.icon}</span>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default FloatingNav;



