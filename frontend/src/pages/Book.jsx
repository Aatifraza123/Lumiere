import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loadRazorpay } from '../utils/razorpay';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar, FiClock, FiDollarSign, FiUser, FiUsers, FiCheckCircle, FiMail, FiPhone } from 'react-icons/fi';

const SERVICE_TYPES = {
  wedding: 'Wedding',
  corporate: 'Corporate Event',
  party: 'Party',
  anniversary: 'Anniversary',
  engagement: 'Engagement',
  other: 'Other'
};

const Book = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [formData, setFormData] = useState({
    hallId: searchParams.get('hallId') || '',
    serviceType: searchParams.get('serviceType') || '',
    eventName: '',
    date: searchParams.get('date') ? new Date(searchParams.get('date')) : today,
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
    guestCount: 100,
    addons: [],
    advancePercent: 10
  });
  const [priceDetails, setPriceDetails] = useState(null);
  const [totalPrice, setTotalPrice] = useState(parseFloat(searchParams.get('price')) || 0);
  const [paymentOption, setPaymentOption] = useState('with-payment');
  
  // OTP States
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [mobileOTPSent, setMobileOTPSent] = useState(false);
  const [emailOTPVerified, setEmailOTPVerified] = useState(false);
  const [mobileOTPVerified, setMobileOTPVerified] = useState(false);
  const [sendingEmailOTP, setSendingEmailOTP] = useState(false);
  const [sendingMobileOTP, setSendingMobileOTP] = useState(false);
  const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);
  const [verifyingMobileOTP, setVerifyingMobileOTP] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/halls');
      return;
    }

    if (searchParams.get('price')) {
      const price = parseFloat(searchParams.get('price'));
      setTotalPrice(price);
      const subtotal = price / 1.18;
      const tax = price - subtotal;
      setPriceDetails({
        basePrice: subtotal * 0.7,
        slotPrice: subtotal * 0.3,
        addonsTotal: 0,
        subtotal,
        tax,
        totalAmount: price
      });
      setStep(2);
    }

    if (formData.hallId) {
      fetchHallDetails();
    }
  }, [isAuthenticated, navigate, formData.hallId]);

  const fetchHallDetails = async () => {
    try {
      const response = await api.get(`/halls/${formData.hallId}`);
      setHall(response.data.data);
    } catch (error) {
      console.error('Error fetching hall:', error);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!user?.email) {
      toast.error('Email not found');
      return;
    }
    setSendingEmailOTP(true);
    try {
      const response = await api.post('/auth/send-otp', { email: user.email });
      if (response.data.success) {
        setEmailOTPSent(true);
        toast.success('OTP sent to your email!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email OTP');
    } finally {
      setSendingEmailOTP(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyingEmailOTP(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: user.email,
        otp: emailOTP
      });
      if (response.data.success) {
        setEmailOTPVerified(true);
        toast.success('Email verified successfully!');
        setStep(4);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingEmailOTP(false);
    }
  };

  const handleSendMobileOTP = async () => {
    if (!user?.phone) {
      toast.error('Phone number not found');
      return;
    }
    setSendingMobileOTP(true);
    try {
      const response = await api.post('/auth/send-mobile-otp', { phone: user.phone });
      if (response.data.success) {
        setMobileOTPSent(true);
        toast.success('OTP sent to your mobile!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send mobile OTP');
    } finally {
      setSendingMobileOTP(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    if (!mobileOTP || mobileOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyingMobileOTP(true);
    try {
      const response = await api.post('/auth/verify-mobile-otp', {
        phone: user.phone,
        otp: mobileOTP
      });
      if (response.data.success) {
        setMobileOTPVerified(true);
        toast.success('Mobile verified successfully!');
        setStep(5);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingMobileOTP(false);
    }
  };

  // Auto-verify Email OTP when 6 digits are entered
  useEffect(() => {
    if (emailOTP.length === 6 && emailOTPSent && !emailOTPVerified && !verifyingEmailOTP) {
      handleVerifyEmailOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailOTP]);

  // Auto-verify Mobile OTP when 6 digits are entered
  useEffect(() => {
    if (mobileOTP.length === 6 && mobileOTPSent && !mobileOTPVerified && !verifyingMobileOTP) {
      handleVerifyMobileOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOTP]);

  const handleSubmitWithoutPayment = async () => {
    const selectedDate = new Date(formData.date);
    selectedDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < todayDate) {
      toast.error('Please select a future date for your event');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        hallId: formData.hallId,
        eventName: formData.eventName,
        eventType: formData.serviceType,
        date: formData.date.toISOString().split('T')[0],
        startTime: formData.startTime,
        endTime: formData.endTime,
        guestCount: formData.guestCount,
        addons: formData.addons || [],
        advancePercent: 0,
        totalAmount: totalPrice,
        paymentStatus: 'pending'
      };

      const response = await api.post('/bookings', bookingData);
      toast.success('Booking confirmed! You can pay later before the event.');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedDate = new Date(formData.date);
    selectedDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < todayDate) {
      toast.error('Please select a future date for your event');
      return;
    }
    
    if (paymentOption === 'with-payment' && (!emailOTPVerified || !mobileOTPVerified)) {
      toast.error('Please verify your email and mobile before proceeding');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        hallId: formData.hallId,
        eventName: formData.eventName,
        eventType: formData.serviceType,
        date: formData.date.toISOString().split('T')[0],
        startTime: formData.startTime,
        endTime: formData.endTime,
        guestCount: formData.guestCount,
        addons: formData.addons || [],
        advancePercent: formData.advancePercent,
        totalAmount: totalPrice
      };

      const response = await api.post('/bookings', bookingData);
      const booking = response.data.data;

      if (paymentOption === 'with-payment') {
        await handlePayment(booking);
      } else {
        toast.success('Booking confirmed!');
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (booking) => {
    try {
      await loadRazorpay();
      const paymentResponse = await api.post('/payments/razorpay/create-order', {
        bookingId: booking._id,
        amount: booking.totalAmount
      });

      const { orderId, amount } = paymentResponse.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Lumière Events',
        description: `Booking ${booking.invoiceNumber}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/razorpay/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingId: booking._id
            });
            toast.success('Payment successful! Booking confirmed.');
            navigate('/dashboard');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#D4AF37' }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Payment initialization failed');
    }
  };

  return (
    <div className="min-h-screen py-20 bg-[#0A0A0A] text-white font-sans relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-8 text-center">Complete Your Booking</h1>

          {/* Progress Steps */}
          <div className="flex justify-between mb-12 relative">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl relative z-10
                    ${step >= s ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-gray-400 border border-white/20'}`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-300
                      ${step > s ? 'bg-[#D4AF37]' : 'bg-white/20'}`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Event Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-4">Event Details</h2>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Event Name</label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g., John & Sarah's Wedding"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Event Date</label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => {
                      if (date) {
                        const selectedDate = new Date(date);
                        selectedDate.setHours(0, 0, 0, 0);
                        const todayDate = new Date();
                        todayDate.setHours(0, 0, 0, 0);
                        if (selectedDate < todayDate) {
                          toast.error('Please select a future date');
                          return;
                        }
                        setFormData({ ...formData, date: selectedDate });
                      }
                    }}
                    minDate={today}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                    required
                  >
                    <option value="">Choose service type</option>
                    {Object.entries(SERVICE_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Guest Count</label>
                  <input
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                    min="1"
                    max={hall?.capacity || 1000}
                    required
                  />
                  {hall && (
                    <p className="text-sm text-gray-400 mt-1">Maximum capacity: {hall.capacity} guests</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.eventName || !formData.serviceType}
                  className="w-full bg-[#D4AF37] text-black py-4 rounded-lg font-semibold text-lg hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </motion.div>
            )}

            {/* Step 2: Review & Payment Option */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-4">Review Your Booking</h2>
                
                {hall && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                    <h3 className="text-xl font-bold mb-3">Venue Details</h3>
                    <p className="font-semibold">{hall.name}</p>
                    <p className="text-gray-400">{hall.location}</p>
                  </div>
                )}

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                  <h3 className="text-xl font-bold mb-3">Event Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-semibold">Event Name:</span> {formData.eventName}</p>
                    <p><span className="font-semibold">Service Type:</span> {SERVICE_TYPES[formData.serviceType]}</p>
                    <p><span className="font-semibold">Date:</span> {formData.date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><span className="font-semibold">Time:</span> {formData.startTime} - {formData.endTime}</p>
                  </div>
                </div>

                {/* Total No. of Guests - Prominently Displayed */}
                <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 p-6 rounded-xl border-2 border-[#D4AF37]/50 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiUsers className="text-3xl text-[#D4AF37]" />
                      <div>
                        <h3 className="text-lg font-semibold">Total No. of Guests</h3>
                        <p className="text-sm text-gray-400">Expected attendance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-[#D4AF37]">{formData.guestCount}</p>
                      <p className="text-sm text-gray-400">guests</p>
                    </div>
                  </div>
                  {hall && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400">
                        Venue Capacity: <span className="text-white font-semibold">{hall.capacity} guests</span>
                        {formData.guestCount > hall.capacity && (
                          <span className="text-red-400 ml-2">⚠️ Exceeds capacity</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {priceDetails && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                    <h3 className="text-xl font-bold mb-3">Price Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="text-[#D4AF37] font-bold text-xl">₹{priceDetails.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Option Selection */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                  <h3 className="text-xl font-bold mb-4">Payment Option</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('with-payment')}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        paymentOption === 'with-payment'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FiDollarSign className={`text-2xl ${paymentOption === 'with-payment' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <h4 className="font-bold">Booking with Payment</h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        Pay now via Razorpay. Your booking will be confirmed immediately after payment.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentOption('without-payment')}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        paymentOption === 'without-payment'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FiCalendar className={`text-2xl ${paymentOption === 'without-payment' ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <h4 className="font-bold">Booking without Payment</h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        Book now and pay later. You'll receive a confirmation and can pay before the event.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/5 border border-white/10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentOption === 'with-payment') {
                        setStep(3);
                      } else {
                        handleSubmitWithoutPayment();
                      }
                    }}
                    className="flex-1 bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors"
                  >
                    {paymentOption === 'with-payment' ? 'Verify Email & Mobile' : 'Confirm Booking'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Email OTP */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-4">Verify Your Email</h2>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FiMail className="text-3xl text-[#D4AF37]" />
                    <div>
                      <h3 className="text-lg font-bold">Email Verification</h3>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  {!emailOTPSent ? (
                    <button
                      type="button"
                      onClick={handleSendEmailOTP}
                      disabled={sendingEmailOTP}
                      className="w-full bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                    >
                      {sendingEmailOTP ? 'Sending...' : 'Send OTP to Email'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={emailOTP}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setEmailOTP(value);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#D4AF37]"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSendEmailOTP}
                          disabled={sendingEmailOTP}
                          className="flex-1 bg-white/5 border border-white/10 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                          Resend OTP
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyEmailOTP}
                          disabled={verifyingEmailOTP || emailOTP.length !== 6 || emailOTPVerified}
                          className="flex-1 bg-[#D4AF37] text-black py-3 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                        >
                          {emailOTPVerified ? 'Verified ✓' : verifyingEmailOTP ? 'Verifying...' : 'Verify Email'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white/5 border border-white/10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  {emailOTPVerified && (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors"
                    >
                      Next: Verify Mobile
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Mobile OTP */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-4">Verify Your Mobile</h2>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FiPhone className="text-3xl text-[#D4AF37]" />
                    <div>
                      <h3 className="text-lg font-bold">Mobile Verification</h3>
                      <p className="text-sm text-gray-400">{user?.phone}</p>
                    </div>
                  </div>

                  {!mobileOTPSent ? (
                    <button
                      type="button"
                      onClick={handleSendMobileOTP}
                      disabled={sendingMobileOTP}
                      className="w-full bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                    >
                      {sendingMobileOTP ? 'Sending...' : 'Send OTP to Mobile'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={mobileOTP}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setMobileOTP(value);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#D4AF37]"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSendMobileOTP}
                          disabled={sendingMobileOTP}
                          className="flex-1 bg-white/5 border border-white/10 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                          Resend OTP
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyMobileOTP}
                          disabled={verifyingMobileOTP || mobileOTP.length !== 6 || mobileOTPVerified}
                          className="flex-1 bg-[#D4AF37] text-black py-3 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                        >
                          {mobileOTPVerified ? 'Verified ✓' : verifyingMobileOTP ? 'Verifying...' : 'Verify Mobile'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-white/5 border border-white/10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  {mobileOTPVerified && (
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="flex-1 bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors"
                    >
                      Proceed to Payment
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Payment */}
            {step === 5 && paymentOption === 'with-payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-4">Confirm & Pay</h2>
                
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                  <h3 className="text-xl font-bold mb-3">Payment Summary</h3>
                  {priceDetails && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="text-[#D4AF37] font-bold text-xl">₹{priceDetails.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 bg-white/5 border border-white/10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !emailOTPVerified || !mobileOTPVerified}
                    className="flex-1 bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#FFD700] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Pay ₹${priceDetails?.totalAmount?.toLocaleString() || totalPrice.toLocaleString()}`}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Book;

