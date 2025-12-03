import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiImage, FiMapPin, 
  FiUsers, FiCheck, FiX, FiStar, FiGrid, FiMaximize 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

// Featured mock venues (matching Home.jsx and HallDetail.jsx)
const FEATURED_MOCK_HALLS = [
  {
    _id: 'royal-palace',
    name: 'The Royal Palace',
    location: 'Udaipur, Rajasthan',
    capacity: 800,
    basePrice: 250000,
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200'],
    amenities: ['Heritage Architecture', 'Lake View', 'Royal Gardens', 'Traditional Decor', 'Premium Catering', 'Bridal Suite', 'Photography Setup', 'Valet Parking'],
    description: 'A majestic heritage palace overlooking the pristine lakes of Udaipur. Experience royal grandeur with modern amenities in this architectural marvel that has hosted countless royal celebrations.',
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'grand-hyatt',
    name: 'Grand Hyatt Ballroom',
    location: 'Mumbai, Maharashtra',
    capacity: 500,
    basePrice: 180000,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'],
    amenities: ['5-Star Hotel', 'Central AC', 'Grand Ballroom', 'Premium Sound System', 'International Cuisine', 'Bridal Suite', 'Concierge Service', 'Valet Parking'],
    description: 'Elegant sophistication meets modern luxury at the Grand Hyatt Ballroom. Located in the heart of Mumbai, this world-class venue offers impeccable service, state-of-the-art facilities, and culinary excellence.',
    isFeatured: true,
    isActive: true
  },
  {
    _id: 'seaside-center',
    name: 'Seaside Convention Center',
    location: 'Goa, India',
    capacity: 300,
    basePrice: 120000,
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200'],
    amenities: ['Beach Access', 'Outdoor & Indoor Spaces', 'Sea View', 'Tropical Decor', 'Seafood Catering', 'Sound System', 'Parking', 'Photography Setup'],
    description: 'A stunning beachside venue where the golden sands meet elegant architecture. Perfect for intimate celebrations with breathtaking ocean views. Experience the perfect blend of tropical paradise and sophisticated event hosting.',
    isFeatured: true,
    isActive: true
  }
];

const AdminHalls = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: '',
    basePrice: '',
    rating: 5,
    amenities: [],
    isFeatured: false,
    isActive: true,
    images: []
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchHalls();
  }, [navigate]);

  const fetchHalls = async () => {
    try {
      const response = await api.get('/admin/halls');
      const dbHalls = response.data.data || [];
      
      // Get deleted mock venues from localStorage
      const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
      
      // Filter out deleted mock venues
      const availableMockVenues = FEATURED_MOCK_HALLS.filter(
        venue => !deletedMockVenues.includes(venue._id)
      );
      
      // Add available mock venues to the list
      const allHalls = [...dbHalls, ...availableMockVenues];
      setHalls(allHalls);
    } catch (error) {
      console.error('Error fetching halls:', error);
      // On error, still show available mock venues
      const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
      const availableMockVenues = FEATURED_MOCK_HALLS.filter(
        venue => !deletedMockVenues.includes(venue._id)
      );
      setHalls(availableMockVenues);
      toast.error('Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAmenity = (e) => {
    e?.preventDefault();
    if (amenityInput.trim()) {
      if (formData.amenities.includes(amenityInput.trim())) {
        toast.error('Amenity already added');
        return;
      }
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);
      
      // Create previews for all files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageUrlAdd = (url) => {
    if (url && url.trim()) {
      const trimmedUrl = url.trim();
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), trimmedUrl]
      }));
      setImagePreviews(prev => [...prev, trimmedUrl]);
      toast.success('Image URL added');
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Frontend validation
      if (!formData.name || !formData.name.trim()) {
        toast.error('Venue name is required');
        return;
      }
      if (!formData.description || !formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      if (!formData.location || !formData.location.trim()) {
        toast.error('Location is required');
        return;
      }
      
      // Validate capacity
      const capacityNum = parseInt(formData.capacity);
      if (!formData.capacity || isNaN(capacityNum) || capacityNum < 1) {
        toast.error('Valid capacity (minimum 1) is required');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('capacity', capacityNum);
      // Handle basePrice - convert empty string to 0
      const basePriceValue = formData.basePrice && formData.basePrice.toString().trim() !== '' 
        ? parseFloat(formData.basePrice) 
        : 0;
      formDataToSend.append('basePrice', basePriceValue);
      // Handle rating - convert to number, default to 5
      const ratingValue = formData.rating && formData.rating.toString().trim() !== '' 
        ? parseFloat(formData.rating) 
        : 5;
      formDataToSend.append('rating', Math.min(Math.max(ratingValue, 0), 5)); // Clamp between 0 and 5
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      formDataToSend.append('priceSlots', JSON.stringify([]));
      formDataToSend.append('servicePricing', JSON.stringify([]));
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      
      // Add image files
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });
      
      // Add image URLs
      if (formData.images && formData.images.length > 0) {
        formDataToSend.append('imageUrls', JSON.stringify(formData.images));
      }

      // Check if editing a mock venue (mock venues have specific IDs)
      const isMockVenue = editingHall && ['royal-palace', 'grand-hyatt', 'seaside-center'].includes(editingHall._id);
      
      if (editingHall && !isMockVenue) {
        // Update existing real venue
        await api.put(`/admin/halls/${editingHall._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Venue updated successfully!');
      } else {
        // Create new venue (either new or from mock venue)
        await api.post('/admin/halls', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (isMockVenue) {
          toast.success('Venue created successfully! (Based on demo venue)');
        } else {
          toast.success('Venue created successfully!');
        }
      }

      closeModal();
      fetchHalls();
    } catch (error) {
      console.error('❌ Error saving venue:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save venue';
      toast.error(errorMessage);
    }
  };

  const openModal = (hall = null) => {
    if (hall) {
      setEditingHall(hall);
      
      // Handle images - can be array of strings or array of objects
      const images = (hall.images || []).map(img => 
        typeof img === 'string' ? img : (img?.url || img)
      );
      
      setFormData({
        name: hall.name || '',
        description: hall.description || '',
        location: hall.location || '',
        capacity: hall.capacity || '',
        basePrice: hall.basePrice || '',
        rating: hall.rating || 5,
        amenities: hall.amenities || [],
        isFeatured: hall.isFeatured || false,
        isActive: hall.isActive !== false,
        images: images
      });
      // Set image previews if existing images
      if (images && images.length > 0) {
        setImagePreviews(images);
      } else {
        setImagePreviews([]);
      }
    } else {
      setEditingHall(null);
      setFormData({
        name: '', description: '', location: '', capacity: '', basePrice: '', rating: 5,
        amenities: [], isFeatured: false, isActive: true, images: []
      });
      setImagePreviews([]);
    }
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHall(null);
    setAmenityInput('');
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleDelete = async (id) => {
    // Check if it's a mock venue
    const isMockVenue = ['royal-palace', 'grand-hyatt', 'seaside-center'].includes(id);
    
    if (isMockVenue) {
      // For mock venues, save to localStorage and remove from list
      if (!window.confirm('Are you sure you want to remove this demo venue from the list?')) return;
      
      // Get current deleted mock venues
      const deletedMockVenues = JSON.parse(localStorage.getItem('deletedMockVenues') || '[]');
      
      // Add this venue ID to deleted list if not already there
      if (!deletedMockVenues.includes(id)) {
        deletedMockVenues.push(id);
        localStorage.setItem('deletedMockVenues', JSON.stringify(deletedMockVenues));
      }
      
      // Remove from current state
      setHalls(prev => prev.filter(hall => hall._id !== id));
      toast.success('Demo venue removed from list');
    } else {
      // For real venues, delete from database
      if (!window.confirm('Are you sure you want to delete this venue?')) return;
      try {
        await api.delete(`/admin/halls/${id}`);
        toast.success('Venue deleted successfully!');
        fetchHalls();
      } catch (error) {
        toast.error('Failed to delete venue');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Venue Management</h1>
            <p className="text-gray-400 mt-1">Configure halls, capacity, and location details.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20"
          >
            <FiPlus className="text-lg" />
            <span>Add New Venue</span>
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.map((hall, index) => {
              // Check if this is a mock venue (has _id starting with 'royal-palace', 'grand-hyatt', or 'seaside-center')
              const isMockVenue = ['royal-palace', 'grand-hyatt', 'seaside-center'].includes(hall._id);
              
              return (
              <motion.div
                key={hall._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 relative"
              >
                {/* Status Badges */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  {hall.isFeatured && (
                    <span className="px-2 py-1 bg-[#D4AF37] text-black text-[10px] uppercase font-bold rounded shadow-lg flex items-center gap-1">
                      <FiStar size={10} /> Featured
                    </span>
                  )}
                  {isMockVenue && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold rounded">
                      Demo
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold backdrop-blur-md border ${
                    hall.isActive 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {hall.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Image Area */}
                <div className="h-52 w-full bg-gradient-to-b from-[#1A1A1A] to-[#050505] flex items-center justify-center relative group-hover:from-[#222] transition-colors">
                  {hall.images && hall.images.length > 0 ? (
                    <img src={hall.images[0]} alt={hall.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <FiImage className="text-5xl text-gray-700 group-hover:text-[#D4AF37]/50 transition-colors duration-300" />
                  )}
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                      onClick={() => openModal(hall)}
                      className="p-3 bg-white text-black rounded-full hover:bg-[#D4AF37] transition-colors"
                      title={isMockVenue ? "Edit (will create new venue)" : "Edit"}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDelete(hall._id)}
                      className="p-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      title={isMockVenue ? "Remove from list" : "Delete"}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6">
                  <h3 className="font-['Cinzel'] text-xl font-bold text-white mb-2 truncate">{hall.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="text-[#D4AF37]" />
                      <span className="truncate max-w-[100px]">{hall.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="text-[#D4AF37]" />
                      <span>{hall.capacity} Pax</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {hall.description}
                  </p>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {hall.amenities?.slice(0, 3).map((item, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] text-gray-300">
                        {item}
                      </span>
                    ))}
                    {(hall.amenities?.length || 0) > 3 && (
                      <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] text-gray-500">
                        +{hall.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
            })}
            
            {/* Add New Card */}
            <button 
              onClick={() => openModal()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 min-h-[350px]"
            >
              <FiPlus className="text-4xl mb-4" />
              <span className="font-medium">Add Another Venue</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <h2 className="font-['Cinzel'] text-xl text-white">
                  {editingHall ? 'Edit Venue Details' : 'Register New Venue'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="hallForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Venue Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="e.g. Grand Ball Room"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Location / City</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Guest Capacity</label>
                      <div className="relative">
                        <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="number"
                          name="capacity"
                          required
                          min="1"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="e.g. 500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Starting Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input
                          type="number"
                          name="basePrice"
                          min="0"
                          step="1000"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          autoComplete="off"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="e.g. 250000"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Base price for the venue (optional)</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Rating</label>
                      <div className="relative">
                        <FiStar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                        <input
                          type="number"
                          name="rating"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.rating}
                          onChange={handleInputChange}
                          autoComplete="off"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="e.g. 4.5"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Rating from 0 to 5 (default: 5)</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-[#D4AF37] transition-colors">Mark as Featured Venue</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-green-400 transition-colors">Active & Available</span>
                      </label>
                    </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Description</label>
                    <textarea
                      name="description"
                      required
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none resize-none"
                      placeholder="Describe the venue ambiance and suitability..."
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Venue Images</label>
                    <div className="space-y-3">
                      {/* Image Previews Grid */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg border border-white/10"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-colors"
                                title="Remove image"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* File Input */}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-[#D4AF37]/50 transition-colors bg-[#0A0A0A]">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiImage className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-[#D4AF37]">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Multiple images allowed)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {/* Or Image URL Input */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[#0A0A0A] px-2 text-gray-500">OR</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-medium">Paste Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            id="imageUrlInput"
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleImageUrlAdd(e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('imageUrlInput');
                              if (input && input.value) {
                                handleImageUrlAdd(input.value);
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-colors text-sm font-semibold"
                          >
                            Add URL
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">Enter image URL and click "Add URL" or press Enter</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm text-gray-400 font-medium flex justify-between">
                      <span>Amenities & Facilities</span>
                      <span className="text-xs text-gray-500">{formData.amenities.length} added</span>
                    </label>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={amenityInput}
                          onChange={(e) => setAmenityInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddAmenity(e)}
                          placeholder="Add amenity (e.g. Parking, AC, WiFi)"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAmenity}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Amenity Chips */}
                    <div className="flex flex-wrap gap-2 p-4 bg-[#0A0A0A] rounded-xl border border-white/5 min-h-[80px]">
                      {formData.amenities.length === 0 && (
                        <span className="text-xs text-gray-600 italic">No amenities listed yet.</span>
                      )}
                      {formData.amenities.map((item, index) => (
                        <motion.span
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-sm text-[#D4AF37]"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveAmenity(index)}
                            className="hover:bg-[#D4AF37]/20 rounded-full p-0.5 ml-1 transition-colors"
                          >
                            <FiX size={14} />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-white/10 bg-[#1A1A1A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="hallForm"
                  className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/10"
                >
                  {editingHall ? 'Save Changes' : 'Create Venue'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHalls;


