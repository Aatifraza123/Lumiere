import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiStar, FiUser, 
  FiCheck, FiX, FiMail, FiMessageSquare, FiImage 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

// Mock data removed - using only real database data

const AdminTestimonials = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    eventType: 'other',
    image: '',
    isApproved: true, // Default to approved for admin-created testimonials
    isActive: true
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchTestimonials();
  }, [navigate]);

  const fetchTestimonials = async () => {
    try {
      console.log('📖 Fetching testimonials from API...');
      console.log('📖 Auth token:', localStorage.getItem('adminToken') || localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await api.get('/admin/testimonials');
      console.log('📖 API Response:', response.data);
      
      const testimonialsData = response.data?.data || [];
      console.log(`📖 Found ${testimonialsData.length} testimonials in database`);
      
      // Always use real data from database, never mock data
      setTestimonials(testimonialsData);
      
      if (testimonialsData.length === 0) {
        console.log('⚠️ No testimonials found in database');
        toast('No testimonials found. Add your first testimonial!', {
          icon: 'ℹ️',
          duration: 3000
        });
      } else {
        console.log('✅ Testimonials loaded from database');
      }
    } catch (error) {
      console.error('❌ Error fetching testimonials:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Show specific error messages
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/admin/login');
      } else if (error.response?.status === 503) {
        toast.error('Database connection unavailable. Please check server.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch testimonials');
      }
      
      // Set empty array instead of mock data
      setTestimonials([]);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('eventType', formData.eventType);
      formDataToSend.append('isApproved', formData.isApproved.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      
      // Handle image - prefer file upload over URL
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image && formData.image.trim()) {
        formDataToSend.append('image', formData.image.trim());
      }

      // Check if editing and if it's a valid MongoDB ObjectId
      const isEditing = editingTestimonial && editingTestimonial._id;
      const isValidObjectId = isEditing && /^[0-9a-fA-F]{24}$/.test(editingTestimonial._id);

      if (isEditing && isValidObjectId) {
        // Update existing testimonial
        await api.put(`/admin/testimonials/${editingTestimonial._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Testimonial updated successfully!');
      } else {
        // Create new testimonial (or if editing mock data, create new)
        if (isEditing && !isValidObjectId) {
          toast('Mock data cannot be edited. Creating new testimonial...', {
            icon: 'ℹ️',
            duration: 3000
          });
        }
        await api.post('/admin/testimonials', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Testimonial added successfully!');
      }

      closeModal();
      fetchTestimonials();
    } catch (error) {
      console.error('❌ Testimonial save error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save testimonial';
      toast.error(errorMessage);
    }
  };

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name || '',
        email: testimonial.email || '',
        rating: testimonial.rating || 5,
        message: testimonial.message || '',
        eventType: testimonial.eventType || 'other',
        image: testimonial.image || '',
        isApproved: testimonial.isApproved || false,
        isActive: testimonial.isActive !== false
      });
      setImagePreview(testimonial.image || '');
      setImageFile(null);
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '', email: '', rating: 5, message: '', eventType: 'other',
        image: '', isApproved: true, isActive: true // Default to approved for new testimonials
      });
      setImagePreview('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      // Check if it's mock data (non-ObjectId ID)
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        // It's mock data, just remove from local state
        setTestimonials(prev => prev.filter(t => t._id !== id));
        toast.success('Testimonial removed from list!');
        return;
      }
      
      await api.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted successfully!');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      wedding: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      corporate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      party: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      anniversary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      engagement: 'bg-red-500/20 text-red-400 border-red-500/30',
      other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Testimonials</h1>
            <p className="text-gray-400 mt-1">Manage customer testimonials and reviews.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20"
          >
            <FiPlus className="text-lg" />
            <span>Add Testimonial</span>
          </button>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#121212] border border-white/5 rounded-xl p-6 hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white">{testimonial.name}</h3>
                      {testimonial.email && (
                        <p className="text-xs text-gray-400">{testimonial.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(testimonial)}
                      className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="p-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Message */}
                <p className="text-gray-300 text-sm mb-4 italic line-clamp-3">
                  "{testimonial.message}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(testimonial.eventType)}`}>
                    {testimonial.eventType}
                  </span>
                  <div className="flex items-center gap-2">
                    {testimonial.isApproved ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs">
                        Pending
                      </span>
                    )}
                    {testimonial.isActive ? (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && testimonials.length === 0 && (
          <div className="text-center py-20">
            <FiMessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No testimonials found. Add your first testimonial!</p>
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
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="e.g. Priya & Arjun"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Rating *</label>
                      <select
                        name="rating"
                        required
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Event Type</label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="wedding">Wedding</option>
                        <option value="corporate">Corporate</option>
                        <option value="party">Party</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="engagement">Engagement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                      placeholder="Enter testimonial message..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Image</label>
                    <div className="flex flex-col gap-4">
                      {imagePreview && (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#D4AF37]">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                      />
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="Or enter image URL"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-xs text-blue-400 font-medium mb-2">💡 Note:</p>
                      <p className="text-xs text-gray-400">
                        Both checkboxes must be checked for the testimonial to appear on the website.
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isApproved"
                          checked={formData.isApproved}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-300">Approve Testimonial</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                        />
                        <span className="text-sm text-gray-300">Active & Visible</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/10"
                    >
                      {editingTestimonial ? 'Update' : 'Create'} Testimonial
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTestimonials;

