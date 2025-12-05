import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiImage, 
  FiCheck, FiX, FiLayers, FiTag, FiCpu, FiMoreHorizontal 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    category: '',
    type: '',
    price: '',
    features: [],
    isActive: true,
    image: ''
  });
  const [featureInput, setFeatureInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchServices();
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
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

  const handleAddFeature = (e) => {
    e?.preventDefault();
    if (featureInput.trim()) {
      if (formData.features.includes(featureInput.trim())) {
        toast.error('Feature already exists');
        return;
      }
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    try {
      console.log('📝 Submitting service form...');
      console.log('📝 Form data:', formData);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.name || formData.title);
      formDataToSend.append('name', formData.name || formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category || formData.type);
      formDataToSend.append('type', formData.category || formData.type);
      formDataToSend.append('features', JSON.stringify(formData.features || []));
      formDataToSend.append('isActive', formData.isActive.toString());
      
      // Add image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
        console.log('📸 Image file added to form');
      } else if (formData.image && formData.image.trim()) {
        // If editing and no new file, keep existing image URL
        formDataToSend.append('image', formData.image.trim());
        console.log('📸 Image URL added to form:', formData.image);
      }

      if (editingService) {
        console.log('🔄 Updating service:', editingService._id);
        await api.put(`/admin/services/${editingService._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Service updated successfully!');
      } else {
        console.log('➕ Creating new service');
        const response = await api.post('/admin/services', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('✅ Service created response:', response.data);
        toast.success('Service created successfully!');
      }

      closeModal();
      fetchServices();
    } catch (error) {
      console.error('❌ Error saving service:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save service';
      toast.error(errorMessage);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title || service.name || '',
        name: service.name || service.title || '',
        description: service.description || '',
        category: service.category || service.type || '',
        type: service.type || service.category || '',
        price: service.price || '',
        features: service.features || [],
        isActive: service.isActive !== false,
        image: service.image || ''
      });
      // Set image preview if existing image
      if (service.image) {
        setImagePreview(service.image);
      } else {
        setImagePreview(null);
      }
    } else {
      setEditingService(null);
      setFormData({
        title: '', name: '', description: '', category: '', 
        type: '', price: '', features: [], isActive: true, image: ''
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFeatureInput('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success('Service deleted successfully!');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Service Catalogue</h1>
            <p className="text-gray-400 mt-1">Manage your offerings, pricing, and packages.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20"
          >
            <FiPlus className="text-lg" />
            <span>Add New Service</span>
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 relative"
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                    service.isActive 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Image Placeholder */}
                <div className="h-48 w-full bg-gradient-to-b from-[#1A1A1A] to-[#050505] flex items-center justify-center relative group-hover:from-[#222] transition-colors">
                  {service.image ? (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <FiLayers className="text-5xl text-gray-700 group-hover:text-[#D4AF37]/50 transition-colors duration-300" />
                  )}
                  
                  {/* Overlay Actions (Visible on Hover) */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                      onClick={() => openModal(service)}
                      className="p-3 bg-white text-black rounded-full hover:bg-[#D4AF37] transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDelete(service._id)}
                      className="p-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1 block">
                      {service.category || service.type}
                    </span>
                    <h3 className="font-['Cinzel'] text-xl font-bold text-white leading-tight">
                      {service.name || service.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">
                    {service.description}
                  </p>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {service.features?.slice(0, 3).map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] uppercase tracking-wide text-gray-300">
                        {feature}
                      </span>
                    ))}
                    {(service.features?.length || 0) > 3 && (
                      <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-gray-500">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Placeholder Card */}
            <button 
              onClick={() => openModal()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 min-h-[300px]"
            >
              <FiPlus className="text-4xl mb-4" />
              <span className="font-medium">Add Another Service</span>
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
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="serviceForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Service Name</label>
                      <div className="relative">
                        <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="e.g. Premium Wedding Package"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Category</label>
                      <div className="relative">
                        <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none appearance-none"
                        >
                          <option value="">Select Category</option>
                          <option value="wedding">Wedding</option>
                          <option value="corporate">Corporate</option>
                          <option value="party">Social Party</option>
                          <option value="birthday">Birthday</option>
                          <option value="engagement">Engagement</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isActive ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Available for Booking</span>
                      </label>
                    </div>
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
                      placeholder="Describe the service details..."
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Service Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                              setFormData(prev => ({ ...prev, image: '' }));
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      )}
                      
                      {/* File Input */}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-[#D4AF37]/50 transition-colors bg-[#0A0A0A]">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiImage className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-[#D4AF37]">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
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
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, image: e.target.value }));
                            if (e.target.value && !imageFile) {
                              setImagePreview(e.target.value);
                            } else if (!e.target.value && !imageFile) {
                              setImagePreview(null);
                            }
                          }}
                          placeholder="https://example.com/image.jpg"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                        />
                        <p className="text-xs text-gray-500">Enter a direct image URL if you prefer not to upload</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm text-gray-400 font-medium flex justify-between">
                      <span>Features Included</span>
                      <span className="text-xs text-gray-500">{formData.features.length} items added</span>
                    </label>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiCpu className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddFeature(e)}
                          placeholder="Type a feature and press Enter"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Feature Chips */}
                    <div className="flex flex-wrap gap-2 p-4 bg-[#0A0A0A] rounded-xl border border-white/5 min-h-[80px]">
                      {formData.features.length === 0 && (
                        <span className="text-xs text-gray-600 italic">No features added yet.</span>
                      )}
                      {formData.features.map((feature, index) => (
                        <motion.span
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-sm text-[#D4AF37]"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
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
                  form="serviceForm"
                  className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/10"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;



