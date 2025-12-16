import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';

const TermsConditions = () => {
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
            <FiFileText className="text-5xl text-[#D4AF37]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-light mb-4">
            Terms & <span className="text-[#D4AF37] font-serif italic">Conditions</span>
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
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using Lumière Events' services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Booking and Reservations</h2>
              <p className="leading-relaxed mb-3">
                All bookings are subject to availability and confirmation. To secure your booking:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>A minimum advance payment of 10% is required at the time of booking</li>
                <li>Full payment must be completed 7 days before the event date</li>
                <li>Bookings are confirmed only upon receipt of advance payment</li>
                <li>We reserve the right to cancel unconfirmed bookings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Cancellation Policy</h2>
              <p className="leading-relaxed mb-3">
                Cancellations must be made in writing via email. The following charges apply:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>More than 90 days before event: 10% of total booking amount</li>
                <li>60-90 days before event: 25% of total booking amount</li>
                <li>30-60 days before event: 50% of total booking amount</li>
                <li>Less than 30 days before event: 100% of total booking amount (no refund)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Venue Usage</h2>
              <p className="leading-relaxed mb-3">
                Clients agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the venue only for the agreed purpose and duration</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not exceed the maximum capacity of the venue</li>
                <li>Be responsible for any damage to the property or equipment</li>
                <li>Ensure all guests behave appropriately and respectfully</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Liability</h2>
              <p className="leading-relaxed">
                Lumière Events shall not be liable for any loss, damage, or injury to persons or property during the event. Clients are advised to obtain appropriate insurance coverage. We are not responsible for items left behind after the event.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Force Majeure</h2>
              <p className="leading-relaxed">
                We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to natural disasters, government restrictions, pandemics, or other force majeure events.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Modifications</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
              <p className="leading-relaxed">
                For any questions regarding these terms and conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-[#D4AF37] font-semibold">Lumière Events</p>
                <p>Email: hello@lumiere.com</p>
                <p>Phone: +91 XXXXX XXXXX</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsConditions;
