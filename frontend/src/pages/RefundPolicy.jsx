import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative selection:bg-[#D4AF37] selection:text-black">
      {/* FILM GRAIN */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[10] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <FiDollarSign className="text-5xl text-[#D4AF37]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-light mb-4">
            Refund <span className="text-[#D4AF37] font-serif italic">Policy</span>
          </h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Refund Eligibility</h2>
              <p className="leading-relaxed">
                Refunds are processed based on the timing of cancellation and the specific circumstances of your booking. We strive to be fair and transparent in all refund decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Cancellation Timeline & Refunds</h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">More than 90 Days Before Event</h3>
                  <p>90% refund of total booking amount (10% cancellation fee)</p>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">60-90 Days Before Event</h3>
                  <p>75% refund of total booking amount (25% cancellation fee)</p>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">30-60 Days Before Event</h3>
                  <p>50% refund of total booking amount (50% cancellation fee)</p>
                </div>
                
                <div className="p-4 bg-white/5 border border-red-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Less than 30 Days Before Event</h3>
                  <p>No refund (100% cancellation fee)</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Refund Process</h2>
              <p className="leading-relaxed mb-3">
                To request a refund:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Submit a written cancellation request via email to hello@lumiere.com</li>
                <li>Include your booking reference number and reason for cancellation</li>
                <li>Refunds will be processed within 7-10 business days</li>
                <li>Refunds will be credited to the original payment method</li>
                <li>You will receive a confirmation email once the refund is processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Non-Refundable Items</h2>
              <p className="leading-relaxed mb-3">
                The following are non-refundable:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Booking fees and service charges</li>
                <li>Third-party vendor costs already incurred</li>
                <li>Custom decorations or arrangements already prepared</li>
                <li>Catering deposits for confirmed orders</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Rescheduling</h2>
              <p className="leading-relaxed mb-3">
                As an alternative to cancellation, you may reschedule your event:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>One free rescheduling allowed per booking (subject to venue availability)</li>
                <li>Additional rescheduling requests may incur administrative fees</li>
                <li>Rescheduling must be requested at least 60 days before the original event date</li>
                <li>New date must be within 12 months of the original booking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Force Majeure</h2>
              <p className="leading-relaxed">
                In case of unforeseen circumstances beyond our control (natural disasters, government restrictions, pandemics, etc.), we will work with you to either reschedule your event or provide a partial refund based on costs already incurred. Full refunds may not be possible in such situations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Venue-Initiated Cancellations</h2>
              <p className="leading-relaxed">
                If we need to cancel your booking due to circumstances within our control, you will receive a full refund of all payments made, including any non-refundable deposits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disputes</h2>
              <p className="leading-relaxed">
                If you have any concerns about a refund decision, please contact our customer service team. We are committed to resolving all disputes fairly and promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
              <p className="leading-relaxed">
                For refund requests or questions about this policy:
              </p>
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-[#D4AF37] font-semibold">Lumière Events - Refunds Department</p>
                <p>Email: refunds@lumiere.com</p>
                <p>Phone: +91 XXXXX XXXXX</p>
                <p>Business Hours: Monday - Saturday, 10:00 AM - 6:00 PM IST</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;
