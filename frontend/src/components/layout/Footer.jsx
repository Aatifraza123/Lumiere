import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook, FiTwitter, FiInstagram, FiArrowRight, FiMail, FiMapPin } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/subscribe', { email: email.trim() });
      if (response.data.success) {
        toast.success('Successfully subscribed to newsletter!');
        setEmail('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Changed bg to #0A0A0A to match Home page
    <footer className="bg-[#0A0A0A] text-white relative overflow-hidden border-t border-white/10 pt-16 pb-10">
      
      {/* Background Brand Text (Watermark) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.02]">
        <h1 className="text-[12vw] font-bold text-center leading-none tracking-tighter text-white select-none translate-y-1/4">
          LUMIÈRE
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* --- BRAND COLUMN --- */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="block">
              <span className="text-3xl font-bold tracking-tighter">LUMIÈRE.</span>
            </Link>
            {/* Increased font size for description */}
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Curating timeless moments for those who celebrate life. Premium event organization tailored to perfection.
            </p>
            
            {/* Newsletter Input */}
            <form onSubmit={handleSubscribe} className="relative max-w-xs">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" 
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 px-6 pr-14 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#D4AF37] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiArrowRight className="text-lg" />
                )}
              </button>
            </form>
          </div>

          {/* --- LINKS COLUMNS --- */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
            
            {/* Explore */}
            <div>
              {/* Increased Heading Size */}
              <h4 className="text-[#D4AF37] font-serif italic text-xl mb-6">Explore</h4>
              {/* Increased Link Size to text-base */}
              <ul className="space-y-3 text-base">
                {['Home', 'About Us', 'Services', 'Halls', 'Gallery'].map((item) => (
                  <li key={item}>
                    <Link 
                      to={`/${item.toLowerCase().replace(' ', '-')}`} 
                      className="group flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="w-0 group-hover:w-2 h-[1px] bg-[#D4AF37] mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-[#D4AF37] font-serif italic text-xl mb-6">Services</h4>
              <ul className="space-y-3 text-base">
                {['Weddings', 'Corporate', 'Parties', 'Engagement'].map((item) => (
                  <li key={item}>
                    <Link 
                      to="/services" 
                      className="group flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="w-0 group-hover:w-2 h-[1px] bg-[#D4AF37] mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-[#D4AF37] font-serif italic text-xl mb-6">Contact</h4>
              <ul className="space-y-4 text-base text-gray-400">
                <li className="flex items-start gap-3">
                   <FiMapPin className="text-[#D4AF37] mt-1.5 shrink-0" />
                   <span>Mumbai, India 400050</span>
                </li>
                <li className="flex items-center gap-3">
                   <FiMail className="text-[#D4AF37] shrink-0" />
                   <a href="mailto:hello@lumiere.com" className="hover:text-white transition-colors">hello@lumiere.com</a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Lumière Events. All rights reserved.</p>
          
          <div className="flex gap-6">
            {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
              <motion.a 
                key={i}
                href="#" 
                whileHover={{ y: -3 }}
                className="text-gray-400 hover:text-[#D4AF37] transition-colors text-xl"
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


