import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  FiArrowRight, FiPlus, FiMinus, FiInstagram, FiTwitter, FiFacebook
} from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // --- FAQ DATA ---
  const faqs = [
    {
      question: "Check-in & Check-out",
      answer: "Check-in begins at 2:00 PM. Check-out is by 11:00 AM. For early arrival or late departure requests, please contact the front desk."
    },
    {
      question: "Private Events & Weddings",
      answer: "We offer bespoke event planning. Our Grand Ballroom holds up to 500 guests. Contact our events team using the form above."
    },
    {
      question: "Parking & Valet",
      answer: "Complimentary valet parking is available for all guests. Secure underground parking is accessible 24/7."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', {
        ...formData,
        subject: `Contact from ${formData.name.trim()}`
      });
      toast.success('Message sent successfully.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37] selection:text-black flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* === LEFT COLUMN: VISUAL & INFO (Fixed on Desktop) === */}
      <div className="lg:w-5/12 relative min-h-[50vh] lg:min-h-screen lg:fixed lg:top-0 lg:left-0 border-r border-white/5">
         {/* Background Image */}
         <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200" 
              alt="Luxury Hotel" 
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-[3s] ease-in-out scale-105 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
         </div>

         {/* Content Overlay */}
         <div className="absolute bottom-0 left-0 w-full p-10 md:p-16 z-10 flex flex-col justify-between h-full">
            {/* Top Logo Area */}
            <div className="pt-20 lg:pt-0">
                <span className="text-[#D4AF37] text-xs font-bold tracking-[0.5em] uppercase block mb-6">Welcome</span>
                <h1 className="font-serif text-5xl md:text-7xl text-white leading-none">
                  Lumiere <br/>
                  <span className="italic font-light text-[#D4AF37]">Royale</span>
                </h1>
            </div>

            {/* Bottom Info Area */}
            <div className="space-y-12">
                <div className="space-y-8">
                    <div className="group">
                        <h3 className="text-xs text-[#D4AF37] uppercase tracking-widest mb-2">Visit Us</h3>
                        <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-200 group-hover:text-white transition-colors">
                            Level 4, Grand Palladium<br/>
                            Lower Parel, Mumbai 400013
                        </p>
                    </div>
                    
                    <div className="group">
                        <h3 className="text-xs text-[#D4AF37] uppercase tracking-widest mb-2">Contact</h3>
                        <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-200 group-hover:text-white transition-colors">
                            +91 98765 43210<br/>
                            hello@lumiere.com
                        </p>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="flex gap-6 pt-6 border-t border-white/10">
                    <FiInstagram size={24} className="text-gray-500 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                    <FiTwitter size={24} className="text-gray-500 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                    <FiFacebook size={24} className="text-gray-500 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                </div>
            </div>
         </div>
      </div>

      {/* === RIGHT COLUMN: FORM & CONTENT (Scrollable) === */}
      <div className="lg:w-7/12 lg:ml-auto bg-[#050505] min-h-screen relative z-10">
         <div className="p-8 md:p-20 lg:p-32 max-w-4xl mx-auto">
            
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
            >
               <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Get in Touch</h2>
               <p className="text-gray-400 font-light text-lg mb-16 leading-relaxed max-w-xl">
                  Whether you are planning a stay or an event, our team is at your disposal to create a personalized experience.
               </p>

               {/* REFINED FORM */}
               <form onSubmit={handleSubmit} className="space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                     {/* Name */}
                     <div className="relative group">
                        <input 
                           type="text" 
                           required 
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-transparent border-b border-white/20 py-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-xl font-light peer"
                           placeholder=" "
                        />
                        <label className="absolute left-0 top-4 text-gray-500 text-base transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:tracking-widest peer-focus:uppercase peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#D4AF37] peer-not-placeholder-shown:tracking-widest peer-not-placeholder-shown:uppercase">
                           Your Name
                        </label>
                     </div>
                     {/* Email */}
                     <div className="relative group">
                        <input 
                           type="email" 
                           required 
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-transparent border-b border-white/20 py-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-xl font-light peer"
                           placeholder=" "
                        />
                        <label className="absolute left-0 top-4 text-gray-500 text-base transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:tracking-widest peer-focus:uppercase peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#D4AF37] peer-not-placeholder-shown:tracking-widest peer-not-placeholder-shown:uppercase">
                           Email Address
                        </label>
                     </div>
                  </div>

                  {/* Phone */}
                  <div className="relative group">
                     <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-transparent border-b border-white/20 py-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-xl font-light peer"
                        placeholder=" "
                     />
                     <label className="absolute left-0 top-4 text-gray-500 text-base transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:tracking-widest peer-focus:uppercase peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#D4AF37] peer-not-placeholder-shown:tracking-widest peer-not-placeholder-shown:uppercase">
                        Phone Number (Optional)
                     </label>
                  </div>

                  {/* Message */}
                  <div className="relative group">
                     <textarea 
                        rows="2"
                        required 
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-transparent border-b border-white/20 py-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-xl font-light peer resize-none"
                        placeholder=" "
                     />
                     <label className="absolute left-0 top-4 text-gray-500 text-base transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:tracking-widest peer-focus:uppercase peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#D4AF37] peer-not-placeholder-shown:tracking-widest peer-not-placeholder-shown:uppercase">
                        How can we help?
                     </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8">
                    <button 
                        disabled={loading}
                        className="group flex items-center gap-6 text-white hover:text-[#D4AF37] transition-all uppercase tracking-[0.2em] text-sm font-bold"
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                        <span className="w-16 h-[1px] bg-white/30 group-hover:bg-[#D4AF37] group-hover:w-32 transition-all duration-300"></span>
                        <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                    </button>
                  </div>
               </form>

               {/* FAQ SECTION */}
               <div className="mt-32">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-12 border-b border-white/10 pb-6">Frequently Asked Questions</h3>
                  <div className="space-y-8">
                     {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-white/5 pb-8">
                           <button 
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full flex justify-between items-center text-left hover:text-[#D4AF37] transition-colors group"
                           >
                              <span className="text-2xl font-serif text-white group-hover:text-[#D4AF37] transition-colors">{faq.question}</span>
                              <span className="text-[#D4AF37] text-xl transition-transform duration-300 transform group-hover:scale-110">
                                {openFaq === i ? <FiMinus/> : <FiPlus/>}
                              </span>
                           </button>
                           <AnimatePresence>
                              {openFaq === i && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                 >
                                    <p className="text-gray-400 font-light text-lg mt-6 leading-relaxed max-w-2xl">{faq.answer}</p>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     ))}
                  </div>
               </div>

            </motion.div>
         </div>
         
         {/* Bottom Map Strip */}
         <div className="h-64 w-full bg-[#111] grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-[1s]">
            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30164.53320436863!2d72.82228605000001!3d19.017533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce8c5c975d91%3A0x2a5e57292f8c028b!2sLower%20Parel%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1629364512345!5m2!1sen!2sin"
               width="100%" 
               height="100%" 
               style={{ border: 0, filter: 'invert(100%) hue-rotate(180deg) contrast(1.1)' }} 
               allowFullScreen="" 
               loading="lazy"
            />
         </div>
      </div>

    </div>
  );
};

export default Contact;









