import { motion } from 'framer-motion';
import { FiXCircle } from 'react-icons/fi';

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <FiXCircle className="text-5xl text-[#D4AF37]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-light mb-4">
            Cancellation <span className="text-[#D4AF37] font-serif italic">Policy</span>
          </h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Cancellation Process</h2>
              <p className="leading-relaxed mb-3">To cancel your booking:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Submit written cancellation via email to hello@lumiere.com</li>
                <li>Include booking reference number</li>
                <li>Cancellation effective from email receipt date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Cancellation Charges</h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">90+ Days Before Event</h3>
                  <p>10% cancellation fee</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">60-90 Days Before Event</h3>
                  <p>25% cancellation fee</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">30-60 Days Before Event</h3>
                  <p>50% cancellation fee</p>
                </div>
                <div className="p-4 bg-white/5 border border-red-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Less than 30 Days</h3>
                  <p>100% cancellation fee (no refund)</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Contact</h2>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-[#D4AF37] font-semibold">Lumière Events</p>
                <p>Email: hello@lumiere.com</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
