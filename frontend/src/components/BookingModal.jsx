import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { FiX, FiChevronRight, FiChevronLeft, FiCalendar, FiClock, FiUsers, FiMail, FiPhone, FiCheckCircle, FiDollarSign, FiCreditCard, FiBookmark } from 'react-icons/fi';
import api from '../utils/api';
import { loadRazorpay } from '../utils/razorpay';

const BookingModal = ({ isOpen, onClose, hall, services }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Step 1: Customer Details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    guests: ''
  });
  
  // Step 2: Service, Date & Time
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  // Step 3: Price & Payment
  const [priceDetails, setPriceDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'offline'
  
  // Time slots
  const timeSlots = [
    { startTime: '09:00', endTime: '13:00', label: 'Morning (9 AM - 1 PM)' },
    { startTime: '14:00', endTime: '18:00', label: 'Afternoon (2 PM - 6 PM)' },
    { startTime: '19:00', endTime: '23:00', label: 'Evening (7 PM - 11 PM)' }
  ];

  useEffect(() => {
    if (hall && selectedService && selectedTimeSlot) {
      calculatePrice();
    }
  }, [hall, selectedService, selectedTimeSlot]);

  const calculatePrice = () => {
    if (!hall || !selectedTimeSlot || !selectedService) {
      setPriceDetails(null);
      return;
    }
    
    // Get price from venue's servicePricing (admin-set price)
    let basePrice = 0;
    if (hall.servicePricing && hall.servicePricing.length > 0) {
      const serviceType = selectedService.category || selectedService.type || 'other';
      const servicePricing = hall.servicePricing.find(
        sp => sp.serviceType === serviceType
      );
      basePrice = servicePricing?.basePrice || hall.basePrice || 0;
    } else {
      basePrice = hall.basePrice || 0;
    }
    
    // Get slot price from venue's priceSlots (admin-set price)
    let slotPrice = 0;
    if (hall.priceSlots && hall.priceSlots.length > 0 && selectedTimeSlot) {
      const matchingSlot = hall.priceSlots.find(
        slot => selectedTimeSlot.startTime >= slot.startTime && 
                selectedTimeSlot.endTime <= slot.endTime
      );
      slotPrice = matchingSlot?.price || 0;
    }
    
    const subtotal = basePrice + slotPrice;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    
    setPriceDetails({ 
      basePrice, 
      slotPrice, 
      subtotal, 
      tax, 
      total 
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate Step 1
      if (!formData.name || !formData.email || !formData.mobile || !formData.guests) {
        toast.error('Please fill in all customer details');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate Step 2
      if (!selectedService) {
        toast.error('Please select a service');
        return;
      }
      if (!selectedDate) {
        toast.error('Please select a date');
        return;
      }
      if (!selectedTimeSlot) {
        toast.error('Please select a time slot');
        return;
      }
      const selectedDateObj = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDateObj < today) {
        toast.error('Please select a future date');
        return;
      }
      if (!priceDetails || priceDetails.total <= 0) {
        toast.error('Price calculation error. Please try again.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    if (!priceDetails || priceDetails.total <= 0) {
      toast.error('Invalid price details');
      return;
    }

    setSubmitting(true);
    try {
      const bookingDate = selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0] 
        : new Date(selectedDate).toISOString().split('T')[0];

      const bookingData = {
        hallId: hall._id,
        eventName: `${selectedService.name || selectedService.title} - ${hall.name}`,
        eventType: selectedService.category || selectedService.type || 'other',
        date: bookingDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        guestCount: parseInt(formData.guests) || 100,
        addons: [],
        advancePercent: paymentMethod === 'online' ? 10 : 0,
        totalAmount: priceDetails.total,
        basePrice: priceDetails.basePrice,
        slotPrice: priceDetails.slotPrice,
        addonsTotal: 0,
        tax: priceDetails.tax,
        paymentStatus: 'pending',
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerMobile: formData.mobile.trim()
      };

      // Create booking
      const bookingResponse = await api.post('/bookings', bookingData);
      const bookingId = bookingResponse.data.data._id;

      if (paymentMethod === 'offline') {
        // Offline payment - booking confirmed without payment
        toast.success('Booking confirmed! You can pay later. Check your email for confirmation.');
        onClose();
        // Reset form
        setCurrentStep(1);
        setFormData({ name: '', email: '', mobile: '', guests: '' });
        setSelectedService(null);
        setSelectedDate(new Date());
        setSelectedTimeSlot(null);
        setPriceDetails(null);
        setPaymentMethod('online');
        setSubmitting(false);
        return;
      }
      
      // Online payment flow
      // Calculate advance amount (10% of total)
      const advanceAmount = Math.round(priceDetails.total * 0.1);
      
      // Create Razorpay order
      const paymentResponse = await api.post('/payments/razorpay/create-order', {
        bookingId: bookingId,
        amount: advanceAmount
      });
      
      const { orderId, amount, currency } = paymentResponse.data;
      
      // Load Razorpay
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        toast.error('Payment gateway failed to load. Please try again.');
        setSubmitting(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency || 'INR',
        name: 'Lumière Events',
        description: `Booking Advance (10%) - Total: ₹${priceDetails.total.toLocaleString()}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await api.post('/payments/razorpay/verify', {
              bookingId: bookingId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
            
            toast.success('Booking confirmed! Check your email for confirmation.');
            onClose();
            // Reset form
            setCurrentStep(1);
            setFormData({ name: '', email: '', mobile: '', guests: '' });
            setSelectedService(null);
            setSelectedDate(new Date());
            setSelectedTimeSlot(null);
            setPriceDetails(null);
            setPaymentMethod('online');
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile
        },
        theme: {
          color: '#D4AF37'
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
        setSubmitting(false);
      });
      razorpay.open();
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#121212] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
            <div>
              <h2 className="text-2xl font-bold text-white">Book This Venue</h2>
              <p className="text-sm text-gray-400">Step {currentStep} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-[#0A0A0A] border-b border-white/10">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      currentStep >= step 
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                        : 'border-white/20 text-gray-400'
                    }`}
                  >
                    {currentStep > step ? <FiCheckCircle /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 transition-colors ${
                      currentStep > step ? 'bg-[#D4AF37]' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Customer Details</span>
              <span>Service & Time</span>
              <span>Checkout</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Customer Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Mobile Number *</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Number of Guests *</label>
                      <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="Expected guests"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Service, Date & Time */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Select Service, Date & Time</h3>
                  
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Select Service *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {services.map((service) => {
                        const serviceType = service.category || service.type || 'other';
                        let servicePrice = 0;
                        if (hall?.servicePricing && hall.servicePricing.length > 0) {
                          const pricing = hall.servicePricing.find(sp => sp.serviceType === serviceType);
                          servicePrice = pricing?.basePrice || hall.basePrice || 0;
                        } else {
                          servicePrice = hall?.basePrice || 0;
                        }
                        
                        return (
                          <button
                            key={service._id}
                            onClick={() => setSelectedService(service)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedService?._id === service._id
                                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                            }`}
                          >
                            <div className="font-semibold text-white mb-1">{service.name || service.title}</div>
                            <div className="text-sm text-gray-400 mb-2">{service.description}</div>
                            <div className="text-[#D4AF37] font-bold">₹{servicePrice.toLocaleString()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Select Date *</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>

                  {/* Time Slot Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Select Time Slot *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {timeSlots.map((slot, index) => {
                        let slotPrice = 0;
                        if (hall?.priceSlots && hall.priceSlots.length > 0) {
                          const matchingSlot = hall.priceSlots.find(
                            s => slot.startTime >= s.startTime && slot.endTime <= s.endTime
                          );
                          slotPrice = matchingSlot?.price || 0;
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedTimeSlot?.startTime === slot.startTime
                                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                            }`}
                          >
                            <div className="font-semibold text-white mb-1">{slot.label}</div>
                            <div className="text-sm text-gray-400">{slot.startTime} - {slot.endTime}</div>
                            {slotPrice > 0 && (
                              <div className="text-[#D4AF37] font-bold mt-2">₹{slotPrice.toLocaleString()}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Checkout */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Review & Checkout</h3>
                  
                  {/* Booking Summary */}
                  <div className="bg-[#0A0A0A] rounded-lg p-6 space-y-4">
                    <div className="flex justify-between text-gray-300">
                      <span>Service:</span>
                      <span className="text-white font-semibold">{selectedService?.name || selectedService?.title}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Date:</span>
                      <span className="text-white font-semibold">
                        {selectedDate instanceof Date ? selectedDate.toLocaleDateString('en-IN') : new Date(selectedDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Time:</span>
                      <span className="text-white font-semibold">{selectedTimeSlot?.label}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Guests:</span>
                      <span className="text-white font-semibold">{formData.guests}</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {priceDetails && (
                    <div className="bg-[#0A0A0A] rounded-lg p-6 space-y-3 border border-[#D4AF37]/20">
                      <h4 className="text-lg font-bold text-white mb-4">Price Breakdown</h4>
                      <div className="flex justify-between text-gray-300">
                        <span>Base Price:</span>
                        <span className="text-white">₹{priceDetails.basePrice.toLocaleString()}</span>
                      </div>
                      {priceDetails.slotPrice > 0 && (
                        <div className="flex justify-between text-gray-300">
                          <span>Time Slot:</span>
                          <span className="text-white">₹{priceDetails.slotPrice.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-300">
                        <span>Subtotal:</span>
                        <span className="text-white">₹{priceDetails.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Tax (18% GST):</span>
                        <span className="text-white">₹{priceDetails.tax.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between">
                        <span className="text-lg font-bold text-white">Total Amount:</span>
                        <span className="text-lg font-bold text-[#D4AF37]">₹{priceDetails.total.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Advance Payment (10%):</span>
                          <span className="text-[#D4AF37]">₹{Math.round(priceDetails.total * 0.1).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div className="bg-[#0A0A0A] rounded-lg p-6 space-y-4 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4">Select Payment Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Online Payment */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          paymentMethod === 'online'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <FiCreditCard className={`text-xl ${paymentMethod === 'online' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                          <span className="font-semibold text-white">Online Payment</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Pay 10% advance now via Razorpay</p>
                        <div className="text-[#D4AF37] font-bold">
                          ₹{Math.round(priceDetails?.total * 0.1 || 0).toLocaleString()}
                        </div>
                      </button>

                      {/* Offline Payment */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('offline')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          paymentMethod === 'offline'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <FiBookmark className={`text-xl ${paymentMethod === 'offline' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                          <span className="font-semibold text-white">Pay Later (Offline)</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Book now, pay later at venue</p>
                        <div className="text-gray-500 font-bold">
                          ₹0 (Pay at venue)
                        </div>
                      </button>
                    </div>
                    {paymentMethod === 'offline' && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-400">
                          <strong>Note:</strong> Your booking will be confirmed. You can pay the full amount later at the venue or contact us for payment details.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#1A1A1A] flex justify-between items-center gap-4">
            <button
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              <FiChevronLeft />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            {currentStep === 3 ? (
              <div className="flex gap-3">
                {/* Book Now (No Payment) */}
                <button
                  onClick={() => {
                    setPaymentMethod('offline');
                    handleBooking();
                  }}
                  disabled={submitting}
                  className="px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/20"
                >
                  {submitting && paymentMethod === 'offline' ? 'Processing...' : 'Book Now'}
                  <FiBookmark />
                </button>
                {/* Online Booking (With Payment) */}
                <button
                  onClick={() => {
                    setPaymentMethod('online');
                    handleBooking();
                  }}
                  disabled={submitting}
                  className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && paymentMethod === 'online' ? 'Processing...' : 'Online Booking'}
                  <FiCreditCard />
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={submitting}
                className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <FiChevronRight />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;

