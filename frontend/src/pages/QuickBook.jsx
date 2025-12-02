import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import { loadRazorpay } from '../utils/razorpay';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiDollarSign, FiCheckCircle, FiArrowRight, FiMail, FiPhone } from 'react-icons/fi';

// Mock Data for Venues (with valid ObjectId format)
const MOCK_VENUES = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'The Grand Royale',
    location: 'Mumbai, Worli',
    capacity: 500,
    basePrice: 250000,
    images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }],
    facilities: ['Parking', 'AC', 'Stage', 'Sound System', 'Catering', 'WiFi'],
    description: 'An architectural masterpiece designed for grand celebrations.',
    priceSlots: [
      { time: 'Morning (9 AM - 2 PM)', price: 200000 },
      { time: 'Evening (5 PM - 11 PM)', price: 300000 },
      { time: 'Full Day', price: 450000 }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Crystal Palace',
    location: 'Delhi, Connaught Place',
    capacity: 300,
    basePrice: 180000,
    images: [{ url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' }],
    facilities: ['Parking', 'AC', 'Stage', 'WiFi', 'Catering'],
    description: 'Elegant venue with crystal chandeliers and premium amenities.',
    priceSlots: [
      { time: 'Morning (9 AM - 2 PM)', price: 150000 },
      { time: 'Evening (5 PM - 11 PM)', price: 220000 },
      { time: 'Full Day', price: 350000 }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Azure Gardens',
    location: 'Bangalore, Whitefield',
    capacity: 400,
    basePrice: 150000,
    images: [{ url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' }],
    facilities: ['Garden', 'Parking', 'AC', 'Stage', 'Photography', 'Catering'],
    description: 'Beautiful outdoor venue surrounded by lush gardens.',
    priceSlots: [
      { time: 'Morning (9 AM - 2 PM)', price: 120000 },
      { time: 'Evening (5 PM - 11 PM)', price: 180000 },
      { time: 'Full Day', price: 280000 }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Royal Heritage',
    location: 'Jaipur, Pink City',
    capacity: 600,
    basePrice: 300000,
    images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' }],
    facilities: ['Parking', 'AC', 'Stage', 'Sound System', 'Catering', 'WiFi', 'Photography'],
    description: 'Royal palace venue with traditional architecture and modern facilities.',
    priceSlots: [
      { time: 'Morning (9 AM - 2 PM)', price: 250000 },
      { time: 'Evening (5 PM - 11 PM)', price: 350000 },
      { time: 'Full Day', price: 550000 }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Ocean View Banquet',
    location: 'Goa, Calangute',
    capacity: 350,
    basePrice: 200000,
    images: [{ url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' }],
    facilities: ['Beach Access', 'Parking', 'AC', 'Stage', 'Catering', 'WiFi'],
    description: 'Stunning beachfront venue with panoramic ocean views.',
    priceSlots: [
      { time: 'Morning (9 AM - 2 PM)', price: 180000 },
      { time: 'Evening (5 PM - 11 PM)', price: 250000 },
      { time: 'Full Day', price: 400000 }
    ]
  }
];

// Mock Data for Services
const MOCK_SERVICES = [
  {
    _id: '507f1f77bcf86cd799439021',
    name: 'Wedding Planning',
    price: 50000,
    description: 'Complete wedding planning service with all amenities',
    type: 'wedding'
  },
  {
    _id: '507f1f77bcf86cd799439022',
    name: 'Corporate Event',
    price: 40000,
    description: 'Professional corporate event management',
    type: 'corporate'
  },
  {
    _id: '507f1f77bcf86cd799439023',
    name: 'Party Planning',
    price: 30000,
    description: 'Fun and vibrant party planning',
    type: 'party'
  },
  {
    _id: '507f1f77bcf86cd799439024',
    name: 'Anniversary Celebration',
    price: 35000,
    description: 'Elegant anniversary celebrations',
    type: 'anniversary'
  },
  {
    _id: '507f1f77bcf86cd799439025',
    name: 'Engagement Ceremony',
    price: 25000,
    description: 'Beautiful engagement ceremony planning',
    type: 'engagement'
  },
  {
    _id: '507f1f77bcf86cd799439026',
    name: 'Birthday Party',
    price: 20000,
    description: 'Memorable birthday celebrations',
    type: 'birthday'
  },
  {
    _id: '507f1f77bcf86cd799439027',
    name: 'Baby Shower',
    price: 18000,
    description: 'Joyful baby shower celebrations',
    type: 'baby-shower'
  },
  {
    _id: '507f1f77bcf86cd799439028',
    name: 'Reception Party',
    price: 45000,
    description: 'Grand reception party planning',
    type: 'reception'
  }
];

const QuickBook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [halls, setHalls] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form Data
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    guests: ''
  });

  const [priceDetails, setPriceDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingOption, setBookingOption] = useState('only-booking'); // 'only-booking' or 'with-payment'

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
  
  // OTP Timer States (60 seconds)
  const [emailOTPTimer, setEmailOTPTimer] = useState(0);
  const [mobileOTPTimer, setMobileOTPTimer] = useState(0);

  useEffect(() => {
    fetchHalls();
    fetchServices();
  }, []);

  useEffect(() => {
    // Pre-select venue if venueId is in URL params
    const venueId = searchParams.get('venueId');
    const serviceId = searchParams.get('serviceId');
    
    if (venueId && halls.length > 0) {
      const venue = halls.find(h => h._id === venueId);
      if (venue) {
        setSelectedVenue(venue);
      }
    }
    
    // Pre-select service if serviceId is in URL params
    if (serviceId && services.length > 0) {
      const service = services.find(s => s._id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [halls, services, searchParams]);

  useEffect(() => {
    calculatePrice();
  }, [selectedVenue, selectedService]);

  // Email OTP Timer
  useEffect(() => {
    let interval = null;
    if (emailOTPTimer > 0) {
      interval = setInterval(() => {
        setEmailOTPTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailOTPTimer]);

  // Mobile OTP Timer
  useEffect(() => {
    let interval = null;
    if (mobileOTPTimer > 0) {
      interval = setInterval(() => {
        setMobileOTPTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mobileOTPTimer]);

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

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/halls?isActive=true');
      console.log('Halls API Response:', response.data);
      
      // Handle different response structures
      let hallsData = [];
      if (response.data?.data) {
        hallsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        hallsData = response.data;
      }
      
      // Filter only active halls
      hallsData = hallsData.filter(hall => hall.isActive !== false);
      
      if (hallsData.length > 0) {
        // Transform data to match expected structure
        const transformedHalls = hallsData.map(hall => ({
          _id: hall._id,
          name: hall.name,
          location: hall.location,
          capacity: hall.capacity,
          basePrice: hall.basePrice || 0,
          images: Array.isArray(hall.images) 
            ? hall.images.map(img => typeof img === 'string' ? { url: img } : img)
            : hall.images ? [{ url: hall.images }] : [],
          facilities: Array.isArray(hall.amenities) ? hall.amenities : hall.facilities || [],
          description: hall.description || '',
          priceSlots: hall.priceSlots || []
        }));
        setHalls(transformedHalls);
        console.log('Halls loaded:', transformedHalls.length);
      } else {
        // Use mock data if API returns empty
        console.warn('No active halls found, using mock data');
        setHalls(MOCK_VENUES);
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
      console.error('Error details:', error.response?.data);
      // Use mock data on error
      setHalls(MOCK_VENUES);
      toast.error('Using demo venues. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services?isActive=true');
      console.log('Services API Response:', response.data);
      
      // Handle different response structures
      let servicesData = [];
      if (response.data?.data) {
        servicesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        servicesData = response.data;
      }
      
      // Filter only active services
      servicesData = servicesData.filter(service => service.isActive !== false);
      
      if (servicesData.length > 0) {
        // Transform data to match expected structure
        const transformedServices = servicesData.map(service => ({
          _id: service._id,
          name: service.title || service.name,
          title: service.title || service.name,
          price: service.price || 0,
          description: service.description || '',
          type: service.category || service.type || 'other',
          category: service.category || service.type || 'other'
        }));
        setServices(transformedServices);
        console.log('Services loaded:', transformedServices.length);
      } else {
        // Use mock data if API returns empty
        console.warn('No active services found, using mock data');
        setServices(MOCK_SERVICES);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      console.error('Error details:', error.response?.data);
      // Use mock data on error
      setServices(MOCK_SERVICES);
      toast.error('Using demo services. Please check your connection.');
    }
  };

  const calculatePrice = () => {
    if (!selectedVenue || !selectedService) {
      setPriceDetails(null);
      return;
    }

    // Venue price is based on service price (no separate venue base price)
    const venuePrice = selectedService.price || 0;
    const servicePrice = selectedService.price || 0;
    
    // Total = Service Price only
    const subtotal = servicePrice;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    setPriceDetails({
      venuePrice,
      servicePrice,
      subtotal,
      tax,
      total
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendEmailOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first');
      return;
    }
    if (emailOTPTimer > 0) {
      toast.error(`Please wait ${emailOTPTimer} seconds before resending`);
      return;
    }
    setSendingEmailOTP(true);
    try {
      const response = await api.post('/auth/send-otp', { email: formData.email });
      if (response.data.success) {
        setEmailOTPSent(true);
        setEmailOTPTimer(60); // Start 60 second timer
        // In development, show OTP in toast if provided
        if (response.data.otp) {
          toast.success(`OTP sent! (Dev: ${response.data.otp})`, { duration: 5000 });
        } else {
          toast.success('OTP sent to your email!');
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send email OTP';
      toast.error(errorMsg);
      // In development, still allow OTP input even if sending fails
      if (import.meta.env.DEV) {
        console.warn('OTP sending failed, but allowing manual entry in development');
      }
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
        email: formData.email,
        otp: emailOTP
      });
      if (response.data.success) {
        setEmailOTPVerified(true);
        toast.success('Email verified successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingEmailOTP(false);
    }
  };

  const handleSendMobileOTP = async () => {
    if (!formData.mobile) {
      toast.error('Please enter your mobile number first');
      return;
    }
    if (mobileOTPTimer > 0) {
      toast.error(`Please wait ${mobileOTPTimer} seconds before resending`);
      return;
    }
    setSendingMobileOTP(true);
    try {
      const response = await api.post('/auth/send-mobile-otp', { phone: formData.mobile });
      if (response.data.success) {
        setMobileOTPSent(true);
        setMobileOTPTimer(60); // Start 60 second timer
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
        phone: formData.mobile,
        otp: mobileOTP
      });
      if (response.data.success) {
        setMobileOTPVerified(true);
        toast.success('Mobile verified successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingMobileOTP(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedVenue) {
      toast.error('Please select a venue');
      return;
    }
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!formData.name || !formData.email || !formData.mobile || !formData.guests) {
      toast.error('Please fill in all your details');
      return;
    }
    if (!emailOTPVerified || !mobileOTPVerified) {
      toast.error('Please verify your email and mobile OTP');
      return;
    }
    if (!priceDetails) {
      toast.error('Price calculation error. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      // Validate guest count
      const guestCount = parseInt(formData.guests);
      if (isNaN(guestCount) || guestCount < 1) {
        toast.error('Please enter a valid number of guests (at least 1)');
        setSubmitting(false);
        return;
      }

      // Ensure date is properly formatted
      const bookingDate = selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0] 
        : new Date(selectedDate).toISOString().split('T')[0];

      const bookingData = {
        hallId: selectedVenue._id,
        eventName: `${selectedService.name || selectedService.title} - ${selectedVenue.name}`,
        eventType: selectedService.type || selectedService.category || 'other',
        date: bookingDate,
        startTime: '09:00', // Default start time
        endTime: '18:00', // Default end time
        guestCount: guestCount,
        addons: [],
        advancePercent: bookingOption === 'with-payment' ? 10 : 0,
        totalAmount: priceDetails.total,
        venuePrice: priceDetails.servicePrice, // Venue price = Service price
        servicePrice: priceDetails.servicePrice,
        paymentStatus: 'pending',
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerMobile: formData.mobile.trim()
      };

      // Validate all required fields
      if (!bookingData.hallId || !bookingData.eventName || !bookingData.eventType || 
          !bookingData.date || !bookingData.customerName || !bookingData.customerEmail || !bookingData.customerMobile) {
        console.error('Missing required fields:', bookingData);
        toast.error('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      console.log('Sending booking data:', bookingData);
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      console.log('Full URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`);

      if (bookingOption === 'with-payment') {
        // Create booking first, then initiate payment
        const bookingResponse = await api.post('/bookings', bookingData);
        const bookingId = bookingResponse.data.data._id;
        
        // Calculate advance amount (10% of total)
        const advanceAmount = Math.round(priceDetails.total * 0.1);
        
        // Create payment order
        const paymentResponse = await api.post('/payments/razorpay/create-order', {
          bookingId: bookingId,
          amount: advanceAmount
        });
        
        const { orderId, amount, currency } = paymentResponse.data;
        
        // Load Razorpay
        const Razorpay = await loadRazorpay();
        if (!Razorpay) {
          toast.error('Payment gateway failed to load');
          setSubmitting(false);
          return;
        }
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          name: 'Lumière Events',
          description: `Advance payment for ${selectedVenue.name}`,
          order_id: orderId,
          handler: async function (response) {
            try {
              await api.post('/payments/razorpay/verify', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: bookingId
              });
              toast.success('Payment successful! Booking confirmed.');
              navigate('/halls');
            } catch (error) {
              toast.error('Payment verification failed');
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
        razorpay.open();
        setSubmitting(false);
      } else {
        // Only booking without payment
        const response = await api.post('/bookings', bookingData);
        toast.success('Booking confirmed! You can pay later.');
        navigate('/halls');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request URL:', error.config?.url);
      
      let errorMessage = 'Booking failed. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Booking endpoint not found. Please check if backend server is running.';
      } else if (error.response?.data) {
        // Handle validation errors
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors.map(err => err.msg || err.message).join(', ');
          errorMessage = `Validation error: ${validationErrors}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen py-6 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold mb-1">Book Your Event</h1>
          <p className="text-gray-400 text-xs">Fill the form below</p>
        </div>

        <div className="space-y-3">
            {/* Service Selection */}
            {selectedVenue && (
              <div className="mb-2 p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <p className="text-xs"><span className="font-semibold">{selectedVenue.name}</span> - {selectedVenue.location}</p>
              </div>
            )}

            <div className="bg-[#111] border border-white/10 rounded-lg p-4">
              <label className="block text-sm font-semibold mb-2">Select Service</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${
                      selectedService?._id === service._id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">{service.name || service.title}</div>
                    <div className="text-[#D4AF37] font-bold text-sm">₹{(service.price || 0).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            {selectedService && (
              <div className="bg-[#111] border border-white/10 rounded-lg p-4">
                <label className="block text-sm font-semibold mb-2">Select Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  inline
                  className="w-full"
                  calendarClassName="!bg-transparent !text-white !border-none"
                  dayClassName={() => "hover:!bg-[#D4AF37] hover:!text-black !rounded-full !text-white"}
                />
              </div>
            )}


            {/* Personal Details */}
            {selectedDate && selectedService && (
              <div className="bg-[#111] border border-white/10 rounded-lg p-4">
                <label className="block text-sm font-semibold mb-3">Your Details</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none text-sm"
                    placeholder="Full Name"
                  />
                  
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none text-sm"
                    placeholder="Number of Guests"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none text-sm mb-2"
                      placeholder="Email Address"
                    />
                    {emailOTPSent && !emailOTPVerified && (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={emailOTP}
                          onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none text-center text-sm"
                          placeholder="OTP"
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOTP}
                          disabled={emailOTP.length !== 6 || verifyingEmailOTP}
                          className="px-3 py-1.5 bg-[#D4AF37] text-black rounded-lg text-xs font-semibold disabled:opacity-50"
                        >
                          {verifyingEmailOTP ? '...' : '✓'}
                        </button>
                      </div>
                    )}
                    {!emailOTPVerified && formData.email && (
                      <button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={sendingEmailOTP || emailOTPTimer > 0}
                        className="w-full py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-xs font-medium disabled:opacity-50"
                      >
                        {sendingEmailOTP 
                          ? 'Sending...' 
                          : emailOTPTimer > 0 
                            ? `Resend in ${emailOTPTimer}s` 
                            : emailOTPSent 
                              ? 'Resend OTP' 
                              : 'Send OTP'}
                      </button>
                    )}
                    {emailOTPVerified && (
                      <p className="text-green-400 text-xs flex items-center gap-1">
                        <FiCheckCircle /> Verified
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none text-sm mb-2"
                      placeholder="Mobile Number"
                    />
                    {mobileOTPSent && !mobileOTPVerified && (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={mobileOTP}
                          onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none text-center text-sm"
                          placeholder="OTP"
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyMobileOTP}
                          disabled={mobileOTP.length !== 6 || verifyingMobileOTP}
                          className="px-3 py-1.5 bg-[#D4AF37] text-black rounded-lg text-xs font-semibold disabled:opacity-50"
                        >
                          {verifyingMobileOTP ? '...' : '✓'}
                        </button>
                      </div>
                    )}
                    {!mobileOTPVerified && formData.mobile && (
                      <button
                        type="button"
                        onClick={handleSendMobileOTP}
                        disabled={sendingMobileOTP || mobileOTPTimer > 0}
                        className="w-full py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-xs font-medium disabled:opacity-50"
                      >
                        {sendingMobileOTP 
                          ? 'Sending...' 
                          : mobileOTPTimer > 0 
                            ? `Resend in ${mobileOTPTimer}s` 
                            : mobileOTPSent 
                              ? 'Resend OTP' 
                              : 'Send OTP'}
                      </button>
                    )}
                    {mobileOTPVerified && (
                      <p className="text-green-400 text-xs flex items-center gap-1">
                        <FiCheckCircle /> Verified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Booking Option & Price */}
            {priceDetails && selectedDate && (
              <div className="bg-[#111] border border-white/10 rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-2">Booking Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBookingOption('only-booking')}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        bookingOption === 'only-booking'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="text-xs font-semibold">Only Booking</div>
                      <div className="text-xs text-gray-400">Pay later</div>
                    </button>
                    <button
                      onClick={() => setBookingOption('with-payment')}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        bookingOption === 'with-payment'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="text-xs font-semibold">Booking + Payment</div>
                      <div className="text-xs text-gray-400">Pay now (10%)</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div className="text-xs">
                    <div className="text-gray-400">Service & Venue</div>
                    <div className="font-semibold">₹{priceDetails.servicePrice.toLocaleString()}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-400">Tax (18%)</div>
                    <div className="font-semibold">₹{priceDetails.tax.toLocaleString()}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-400">Total</div>
                    <div className="text-lg font-bold text-[#D4AF37]">₹{priceDetails.total.toLocaleString()}</div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !emailOTPVerified || !mobileOTPVerified || !formData.name || !formData.guests}
                  className="w-full py-2 bg-[#D4AF37] text-black rounded-lg font-bold hover:bg-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? 'Processing...' : bookingOption === 'with-payment' ? 'Pay & Book Now' : 'Confirm Booking'}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuickBook;

