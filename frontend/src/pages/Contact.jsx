import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiMail, FiPhone, FiSend, FiClock } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📝 Submitting contact form...');
      console.log('📝 Form data:', formData);
      
      // Prepare data - add subject if not provided (use message first 50 chars)
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || '',
        subject: `Contact from ${formData.name.trim()}`,
        message: formData.message.trim()
      };

      console.log('📝 Sending to API:', contactData);

      const response = await api.post('/contact', contactData);
      
      console.log('✅ Contact form submitted successfully:', response.data);
      
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('❌ Error submitting contact form:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black pb-20">
      
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-7xl mx-auto px-6 pt-32 relative z-20">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Get in Touch</span>
          <h1 className="text-5xl md:text-7xl font-light mb-6">Let's Create <span className="font-serif italic text-[#D4AF37]">Magic</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Ready to start planning your event? We're here to answer your questions and bring your vision to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT: CONTACT FORM */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#111] border border-white/10 p-8 md:p-12 rounded-[2rem] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]" />
            
            <h2 className="text-3xl font-light mb-8">Send a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {['name', 'email', 'phone'].map((field) => (
                <motion.div key={field} variants={itemVariants} className="relative">
                  <label 
                    className={`absolute left-0 transition-all duration-300 pointer-events-none
                      ${focusedField === field || formData[field] 
                        ? '-top-5 text-xs text-[#D4AF37]' 
                        : 'top-3 text-gray-500'}`}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    required
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    onFocus={() => setFocusedField(field)}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-transparent"
                  />
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="relative mt-8">
                <label 
                  className={`absolute left-0 transition-all duration-300 pointer-events-none
                    ${focusedField === 'message' || formData.message 
                      ? '-top-5 text-xs text-[#D4AF37]' 
                      : 'top-3 text-gray-500'}`}
                >
                  Your Message
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none placeholder-transparent"
                />
              </motion.div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-4 mt-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Message <FiSend /></>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* RIGHT: INFO & MAP */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                <FiMail className="text-[#D4AF37] text-2xl mb-4" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email</h3>
                <p className="text-lg">hello@lumiere.com</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                <FiPhone className="text-[#D4AF37] text-2xl mb-4" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</h3>
                <p className="text-lg">+91 98765 43210</p>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
              <div className="flex items-start gap-4">
                <FiMapPin className="text-[#D4AF37] text-2xl mt-1 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Studio</h3>
                  <p className="text-lg leading-relaxed">
                    The Grand Palladium, Level 4<br />
                    Lower Parel, Mumbai 400013
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Dark Mode Map Placeholder */}
            <motion.div 
              variants={itemVariants}
              className="h-64 w-full rounded-2xl overflow-hidden border border-white/10 relative group"
            >
              {/* Using a filtered Google Maps iframe for dark mode effect */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30164.53320436863!2d72.82228605000001!3d19.017533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce8c5c975d91%3A0x2a5e57292f8c028b!2sLower%20Parel%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1629364512345!5m2!1sen!2sin"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                allowFullScreen="" 
                loading="lazy"
                className="opacity-70 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-2xl" />
            </motion.div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Contact;






