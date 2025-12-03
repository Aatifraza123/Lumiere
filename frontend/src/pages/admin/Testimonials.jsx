import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiStar, FiUser, 
  FiCheck, FiX, FiMail, FiMessageSquare, FiImage, FiLoader 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminTestimonials = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  
  // Image Handling
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
    isApproved: true,
    isActive: true
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchTestimonials();
  }, [navigate]);

  // Helper: Robust ObjectId Validation
  const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/admin/testimonials');
      const testimonialsData = response.data?.data || [];
      setTestimonials(testimonialsData);
      
      if (testimonialsData.length === 0) {
        toast('No testimonials found. Add your first one!', {
          icon: 'ℹ️',
          style: { background: '#333', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching testimonials:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        toast.error('Failed to load testimonials.');
      }
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
      // Validation: Check size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size too large (max 5MB)');
        return;
      }
      
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Saving testimonial...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('eventType', formData.eventType);
      formDataToSend.append('isApproved', formData.isApproved.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image && formData.image.trim()) {
        formDataToSend.append('image', formData.image.trim());
      }

      const isEditing = editingTestimonial && editingTestimonial._id;
      
      // CRITICAL FIX: Do not manually set Content-Type header for FormData.
      // Axios sets it automatically with the correct boundary.
      
      if (isEditing && isValidObjectId(editingTestimonial._id)) {
        await api.put(`/admin/testimonials/${editingTestimonial._id}`, formDataToSend);
        toast.success('Testimonial updated successfully!', { id: toastId });
      } else {
        await api.post('/admin/testimonials', formDataToSend);
        toast.success('Testimonial created successfully!', { id: toastId });
      }

      closeModal();
      fetchTestimonials();
    } catch (error) {
      console.error('❌ Save error:', error);
      
      // Detailed Error Handling
      let errorMessage = 'Failed to save testimonial';
      if (error.response?.status === 413) {
        errorMessage = 'Image file is too large';
      } else if (error.response?.status === 415) {
        errorMessage = 'Unsupported file format';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    setDeletingId(id); // Start loading for this specific ID
    
    try {
      // Handle legacy/mock data locally
      if (!isValidObjectId(id)) {
        setTestimonials(prev => prev.filter(t => t._id !== id));
        toast.success('Local item removed');
        return;
      }
      
      await api.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted successfully!');
      
      // Optimistic update: remove from UI immediately
      setTestimonials(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete testimonial');
      // If error, refetch to ensure UI is in sync
      fetchTestimonials();
    } finally {
      setDeletingId(null);
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
        isApproved: testimonial.isApproved ?? false,
        isActive: testimonial.isActive ?? true
      });
      setImagePreview(testimonial.image || '');
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '', email: '', rating: 5, message: '', eventType: 'other',
        image: '', isApproved: true, isActive: true
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setImageFile(null);
    setImagePreview('');
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
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20 active:scale-95"
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
            <AnimatePresence mode="popLayout">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-[#121212] border border-white/5 rounded-xl p-6 hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col h-full"
                  style={{ willChange: 'transform' }} // Performance Optimization
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-[#D4AF37]/10">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white truncate max-w-[150px]">{testimonial.name}</h3>
                        {testimonial.email && (
                          <p className="text-xs text-gray-400 truncate max-w-[150px]">{testimonial.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(testimonial)}
                        className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        disabled={deletingId === testimonial._id}
                        className={`p-2 border rounded-full transition-colors ${
                          deletingId === testimonial._id 
                            ? 'bg-red-500/20 border-red-500/30 cursor-wait' 
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white'
                        }`}
                        title="Delete"
                      >
                        {deletingId === testimonial._id ? (
                          <FiLoader size={16} className="animate-spin text-red-500" />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
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
                            : 'text-gray-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="text-gray-300 text-sm mb-4 italic line-clamp-3 flex-grow">
                    "{testimonial.message}"
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(testimonial.eventType)}`}>
                      {testimonial.eventType.charAt(0).toUpperCase() + testimonial.eventType.slice(1)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${testimonial.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      <span className={`text-xs ${testimonial.isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                        {testimonial.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && testimonials.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No testimonials yet</h3>
            <p className="text-gray-400">Create your first testimonial to showcase social proof.</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#121212] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <h2 className="font-['Cinzel'] text-xl text-white">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Grid for basic info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Name <span className="text-[#D4AF37]">*</span></label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="Client Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="client@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Rating <span className="text-[#D4AF37]">*</span></label>
                      <select
                        name="rating"
                        required
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Event Type</label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
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
                    <label className="text-sm text-gray-400 font-medium">Message <span className="text-[#D4AF37]">*</span></label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="Enter testimonial message..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Client Image</label>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                      {imagePreview ? (
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg border border-[#D4AF37]/30" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setFormData(prev => ({...prev, image: ''}));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-[#0A0A0A] rounded-lg flex items-center justify-center border border-white/10 text-gray-600">
                          <FiImage size={24} />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer text-sm text-gray-300">
                            <FiPlus className="mr-2" /> Upload Image
                          </div>
                        </div>
                        <div className="text-center text-gray-500 text-xs">- OR -</div>
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="Paste Image URL"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isApproved ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-green-500/50'}`}>
                         {formData.isApproved && <FiCheck className="text-black text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        name="isApproved"
                        checked={formData.isApproved}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div>
                        <span className="text-sm text-white block">Approve Testimonial</span>
                        <span className="text-xs text-gray-500">Display publicly on website</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer flex-1 group">
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isActive ? 'bg-blue-500 border-blue-500' : 'border-gray-500 group-hover:border-blue-500/50'}`}>
                         {formData.isActive && <FiCheck className="text-black text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div>
                         <span className="text-sm text-white block">Active Status</span>
                         <span className="text-xs text-gray-500">Enable/Disable without deleting</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-transparent border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-white font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/10 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                           {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                        </>
                      )}
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


