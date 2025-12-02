import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiMapPin, FiStar, FiArrowRight, FiShield, FiInfo, FiCheckCircle, FiCalendar, FiMail, FiPhone, FiUsers, FiClock } from 'react-icons/fi';
import api from '../utils/api';

// --- MOCK DATA ---
const MOCK_HALLS = {
  '1': {
    _id: '1',
    name: 'The Grand Royale',
    location: 'Worli, Mumbai',
    capacity: 500,
    basePrice: 250000,
    rating: 4.9,
    reviews: 124,
    images: [
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' },
      { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200' }
    ],
    facilities: ['Valet Parking', 'Central AC', 'Grand Stage', 'Bose Sound System', '5-Star Catering', 'Bridal Suite', 'Live Streaming'],
    description: 'An architectural masterpiece designed for grand celebrations. Floor-to-ceiling windows, state-of-the-art lighting, and five-star catering facilities make this venue perfect for discerning hosts who demand excellence.',
    priceSlots: [
      { startTime: '09:00', endTime: '13:00', price: 200000 },
      { startTime: '14:00', endTime: '18:00', price: 220000 },
      { startTime: '19:00', endTime: '23:00', price: 250000 }
    ],
    servicePrices: [
      { serviceType: 'wedding', label: 'Royal Wedding', basePrice: 300000 },
      { serviceType: 'corporate', label: 'Corporate Gala', basePrice: 200000 },
      { serviceType: 'party', label: 'Luxury Party', basePrice: 150000 },
      { serviceType: 'anniversary', label: 'Golden Jubilee', basePrice: 180000 },
      { serviceType: 'engagement', label: 'Ring Ceremony', basePrice: 160000 }
    ]
  },
  'royal-palace': {
    _id: 'royal-palace',
    name: 'The Royal Palace',
    location: 'Udaipur, Rajasthan',
    capacity: 800,
    basePrice: 250000,
    rating: 4.9,
    reviews: 156,
    images: [
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200' },
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' }
    ],
    facilities: ['Heritage Architecture', 'Lake View', 'Royal Gardens', 'Traditional Decor', 'Premium Catering', 'Bridal Suite', 'Photography Setup', 'Valet Parking'],
    description: 'A majestic heritage palace overlooking the pristine lakes of Udaipur. Experience royal grandeur with modern amenities in this architectural marvel that has hosted countless royal celebrations. Perfect for grand weddings and prestigious events.',
    priceSlots: [
      { startTime: '09:00', endTime: '13:00', price: 220000 },
      { startTime: '14:00', endTime: '18:00', price: 240000 },
      { startTime: '19:00', endTime: '23:00', price: 250000 }
    ],
    servicePrices: [
      { serviceType: 'wedding', label: 'Royal Wedding', basePrice: 350000 },
      { serviceType: 'corporate', label: 'Corporate Gala', basePrice: 250000 },
      { serviceType: 'party', label: 'Luxury Party', basePrice: 200000 },
      { serviceType: 'anniversary', label: 'Golden Jubilee', basePrice: 230000 },
      { serviceType: 'engagement', label: 'Ring Ceremony', basePrice: 210000 }
    ]
  },
  'grand-hyatt': {
    _id: 'grand-hyatt',
    name: 'Grand Hyatt Ballroom',
    location: 'Mumbai, Maharashtra',
    capacity: 500,
    basePrice: 180000,
    rating: 4.8,
    reviews: 203,
    images: [
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200' },
      { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' }
    ],
    facilities: ['5-Star Hotel', 'Central AC', 'Grand Ballroom', 'Premium Sound System', 'International Cuisine', 'Bridal Suite', 'Concierge Service', 'Valet Parking'],
    description: 'Elegant sophistication meets modern luxury at the Grand Hyatt Ballroom. Located in the heart of Mumbai, this world-class venue offers impeccable service, state-of-the-art facilities, and culinary excellence for your most important celebrations.',
    priceSlots: [
      { startTime: '09:00', endTime: '13:00', price: 160000 },
      { startTime: '14:00', endTime: '18:00', price: 170000 },
      { startTime: '19:00', endTime: '23:00', price: 180000 }
    ],
    servicePrices: [
      { serviceType: 'wedding', label: 'Royal Wedding', basePrice: 250000 },
      { serviceType: 'corporate', label: 'Corporate Gala', basePrice: 180000 },
      { serviceType: 'party', label: 'Luxury Party', basePrice: 140000 },
      { serviceType: 'anniversary', label: 'Golden Jubilee', basePrice: 160000 },
      { serviceType: 'engagement', label: 'Ring Ceremony', basePrice: 150000 }
    ]
  },
  'seaside-center': {
    _id: 'seaside-center',
    name: 'Seaside Convention Center',
    location: 'Goa, India',
    capacity: 300,
    basePrice: 120000,
    rating: 4.7,
    reviews: 98,
    images: [
      { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200' },
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200' },
      { url: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200' }
    ],
    facilities: ['Beach Access', 'Outdoor & Indoor Spaces', 'Sea View', 'Tropical Decor', 'Seafood Catering', 'Sound System', 'Parking', 'Photography Setup'],
    description: 'A stunning beachside venue where the golden sands meet elegant architecture. Perfect for intimate celebrations with breathtaking ocean views. Experience the perfect blend of tropical paradise and sophisticated event hosting.',
    priceSlots: [
      { startTime: '09:00', endTime: '13:00', price: 100000 },
      { startTime: '14:00', endTime: '18:00', price: 110000 },
      { startTime: '19:00', endTime: '23:00', price: 120000 }
    ],
    servicePrices: [
      { serviceType: 'wedding', label: 'Royal Wedding', basePrice: 180000 },
      { serviceType: 'corporate', label: 'Corporate Gala', basePrice: 120000 },
      { serviceType: 'party', label: 'Luxury Party', basePrice: 90000 },
      { serviceType: 'anniversary', label: 'Golden Jubilee', basePrice: 110000 },
      { serviceType: 'engagement', label: 'Ring Ceremony', basePrice: 100000 }
    ]
  }
};

const HallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [hall, setHall] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [showCalendar, setShowCalendar] = useState(false); // Toggle for mobile/compact view if needed
  
  // User Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    guests: ''
  });

  const [priceDetails, setPriceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentOption, setPaymentOption] = useState('with-payment'); // 'with-payment' or 'without-payment'
  const [submitting, setSubmitting] = useState(false);
  
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
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    if (id) {
      fetchHallDetails();
      fetchServices();
    } else {
      // If no ID, use mock data
      setHall(MOCK_HALLS['1']);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (hall && selectedService && selectedTimeSlot) calculatePrice();
  }, [selectedService, selectedTimeSlot, hall]);

  const fetchHallDetails = async () => {
    try {
      // Check if ID is a valid MongoDB ObjectId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      // Check if it's a mock venue ID
      if (MOCK_HALLS[id]) {
        console.log('Using mock data for venue:', id);
        setHall(MOCK_HALLS[id]);
        setLoading(false);
        return;
      }
      
      if (!isValidObjectId && id !== '1' && id !== '2' && id !== '3') {
        // If not a valid ObjectId and not a mock ID, use mock data
        console.warn('Invalid hall ID format, using mock data');
        setHall(MOCK_HALLS['1']);
        setLoading(false);
        return;
      }

      const response = await api.get(`/halls/${id}`);
      if (response.data && response.data.data) {
        setHall(response.data.data);
      } else {
        // Fallback to mock data
        setHall(MOCK_HALLS[id] || MOCK_HALLS['1']);
      }
    } catch (error) {
      // If 404 or invalid ID, use mock data
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.warn('Hall not found in database, using mock data');
        setHall(MOCK_HALLS[id] || MOCK_HALLS['1']);
      } else {
        console.error('Error fetching hall:', error);
        // Fallback to mock data
        setHall(MOCK_HALLS['1']);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      const servicesData = response.data?.data || response.data || [];
      if (servicesData.length > 0) {
        setServices(servicesData);
      } else {
        // Fallback to mock services if API returns empty
        setServices([
          { _id: '1', name: 'Wedding Planning', price: 50000, description: 'Complete wedding planning service', type: 'wedding' },
          { _id: '2', name: 'Corporate Event', price: 40000, description: 'Professional corporate event management', type: 'corporate' },
          { _id: '3', name: 'Party Planning', price: 30000, description: 'Fun and vibrant party planning', type: 'party' },
          { _id: '4', name: 'Anniversary Celebration', price: 35000, description: 'Elegant anniversary celebrations', type: 'anniversary' },
          { _id: '5', name: 'Engagement Ceremony', price: 25000, description: 'Beautiful engagement ceremonies', type: 'engagement' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to mock services on error
      setServices([
        { _id: '1', name: 'Wedding Planning', price: 50000, description: 'Complete wedding planning service', type: 'wedding' },
        { _id: '2', name: 'Corporate Event', price: 40000, description: 'Professional corporate event management', type: 'corporate' },
        { _id: '3', name: 'Party Planning', price: 30000, description: 'Fun and vibrant party planning', type: 'party' },
        { _id: '4', name: 'Anniversary Celebration', price: 35000, description: 'Elegant anniversary celebrations', type: 'anniversary' },
        { _id: '5', name: 'Engagement Ceremony', price: 25000, description: 'Beautiful engagement ceremonies', type: 'engagement' }
      ]);
    }
  };

  const calculatePrice = () => {
    if (!hall || !selectedTimeSlot || !selectedService) {
      setPriceDetails(null);
      return;
    }
    
    const basePrice = hall.basePrice || 0;
    const servicePrice = selectedService.price || 0;
    const slotPrice = selectedTimeSlot.price || 0;
    
    const subtotal = basePrice + servicePrice + slotPrice;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    setPriceDetails({ 
      basePrice, 
      servicePrice, 
      slotPrice, 
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
    setSendingEmailOTP(true);
    try {
      const response = await api.post('/auth/send-otp', { email: formData.email });
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
    setSendingMobileOTP(true);
    try {
      const response = await api.post('/auth/send-mobile-otp', { phone: formData.mobile });
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

  const handleBookNow = async () => {
    if (!hall) {
      toast.error('Hall information is not available.');
      return;
    }
    if (!formData.name || !formData.email || !formData.mobile || !formData.guests) {
      toast.error('Please fill in all your details.');
      return;
    }
    if (!priceDetails) {
      toast.error('Please complete the booking selection.');
      return;
    }
    if (!selectedDate || !selectedTimeSlot || !selectedService) {
      toast.error('Please select date, time slot, and service.');
      return;
    }

    // Check OTP verification for payment option
    if (paymentOption === 'with-payment' && (!emailOTPVerified || !mobileOTPVerified)) {
      toast.error('Please verify your email and mobile OTP before proceeding with payment.');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        hallId: hall._id,
        eventName: `${selectedService.name} - ${hall.name}`,
        eventType: selectedService.type || selectedService.name,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        guestCount: parseInt(formData.guests),
        addons: [],
        advancePercent: paymentOption === 'with-payment' ? 10 : 0,
        totalAmount: priceDetails.total,
        paymentStatus: paymentOption === 'with-payment' ? 'pending' : 'pending',
        customerName: formData.name,
        customerEmail: formData.email,
        customerMobile: formData.mobile
      };

      if (paymentOption === 'with-payment') {
        // Navigate to Book page with payment
        navigate(`/book?hallId=${hall._id}&price=${priceDetails.total}&date=${bookingData.date}&startTime=${selectedTimeSlot.startTime}&endTime=${selectedTimeSlot.endTime}&serviceType=${selectedService.type || selectedService.name}`);
      } else {
        // Direct booking without payment
        const response = await api.post('/bookings', bookingData);
        toast.success('Booking confirmed! You can pay later before the event.');
        navigate('/halls');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#0A0A0A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading venue details...</p>
        </div>
      </div>
    );
  }

  // If no hall data, show error or fallback
  if (!hall) {
    return (
      <div className="bg-[#0A0A0A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Venue not found</p>
          <button 
            onClick={() => navigate('/halls')}
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-full font-bold hover:bg-[#FFD700] transition-colors"
          >
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  // Ensure images array exists and has items
  // Handle images - can be array of strings or array of objects with url property
  const images = (hall.images || []).map(img => 
    typeof img === 'string' ? img : (img?.url || img)
  );
  const defaultImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200';

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black pb-20">
      
      {/* HERO SECTION */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-2 p-2">
          <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
            <img 
              src={images[0] || defaultImage} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Main" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
                <FiStar className="fill-current" /> <span>{hall.rating || 0} ({hall.reviews || 0} reviews)</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">{hall.name || 'Venue'}</h1>
              <p className="text-xl text-gray-300 flex items-center gap-2 mt-2"><FiMapPin /> {hall.location || 'Location'}</p>
            </div>
          </div>
          <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden">
            <img 
              src={images[1] || defaultImage} 
              className="w-full h-full object-cover hover:scale-110 transition-transform" 
              alt="Gallery 2" 
            />
          </div>
          <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden">
            <img 
              src={images[2] || defaultImage} 
              className="w-full h-full object-cover hover:scale-110 transition-transform" 
              alt="Gallery 3" 
            />
          </div>
          <div className="col-span-2 row-span-1 rounded-2xl overflow-hidden">
            <img 
              src={images[3] || defaultImage} 
              className="w-full h-full object-cover hover:scale-110 transition-transform" 
              alt="Gallery 4" 
            />
          </div>
        </motion.div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 -mt-10">
        
        {/* --- CONTENT --- */}
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><span className="w-12 h-[1px] bg-[#D4AF37]" /> About the Venue</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">{hall.description || 'No description available.'}</p>
            
            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#D4AF37]/50 transition-colors">
                <FiUsers className="text-[#D4AF37] text-2xl mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{hall.capacity || 'N/A'}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Capacity</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#D4AF37]/50 transition-colors">
                <div className="text-[#D4AF37] text-2xl mb-2 font-bold">₹</div>
                <div className="text-2xl font-bold text-white mb-1">₹{hall.basePrice || 0}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Starting Price</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#D4AF37]/50 transition-colors">
                <FiStar className="text-[#D4AF37] text-2xl mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{hall.rating || '4.5'}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Rating</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#D4AF37]/50 transition-colors">
                <FiMapPin className="text-[#D4AF37] text-2xl mb-2" />
                <div className="text-sm font-bold text-white mb-1 line-clamp-2">{hall.location || 'Location'}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Location</div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-[#D4AF37]" />
                Facilities & Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(hall.facilities || []).map((fac, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                    <FiCheckCircle className="text-[#D4AF37] shrink-0" />
                    <span className="text-sm font-medium">{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Additional Details Section */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              Venue Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-[#D4AF37]">Event Types</h4>
                <div className="space-y-2">
                  {['Weddings', 'Corporate Events', 'Birthday Parties', 'Anniversaries', 'Engagements'].map((type, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-[#D4AF37]">Available Services</h4>
                <div className="space-y-2">
                  {['Catering', 'Decoration', 'Photography', 'Sound System', 'Lighting', 'Valet Parking'].map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Book Now Button */}
          <section className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-2xl md:text-3xl font-['Playfair_Display'] font-light mb-3">
                Ready to Book <span className="text-[#D4AF37] italic">This Venue?</span>
              </h3>
              <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
                Click below to proceed with booking
              </p>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/quick-book?venueId=${hall._id}`)}
                className="group relative px-6 py-3 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#FFD700] text-white rounded-full font-semibold text-sm overflow-hidden shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Book This Venue</span>
                  <FiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#8B4513]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HallDetail;


