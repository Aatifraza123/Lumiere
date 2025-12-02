import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiImage, FiTag, 
  FiCheck, FiX, FiMaximize2, FiEye 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminGallery = () => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: 'other',
    isActive: true
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchGallery();
  }, [navigate]);

  const fetchGallery = async () => {
    try {
      const response = await api.get('/admin/gallery');
      setGallery(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to fetch gallery items');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        isActive: formData.isActive.toString()
      };

      if (editingItem) {
        await api.put(`/admin/gallery/${editingItem._id}`, submitData);
        toast.success('Image updated successfully!');
      } else {
        await api.post('/admin/gallery', submitData);
        toast.success('Image added to gallery!');
      }

      closeModal();
      fetchGallery();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        description: item.description || '',
        image: item.image || '',
        category: item.category || 'other',
        isActive: item.isActive !== false
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '', description: '', image: '', category: 'other', isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this image?')) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      toast.success('Image removed successfully!');
      fetchGallery();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Media Gallery</h1>
            <p className="text-gray-400 mt-1">Curate your portfolio images and event showcases.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20"
          >
            <FiPlus className="text-lg" />
            <span>Add Image</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gallery.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 aspect-[4/5]"
              >
                {/* Full Size Image Background */}
                <div className="absolute inset-0 bg-gray-900">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="text-4xl text-gray-700" />
                    </div>
                  )}
                </div>

                {/* Status & Category Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded border border-white/10">
                    {item.category}
                  </span>
                  {!item.isActive && (
                     <span className="px-2 py-1 bg-red-500/80 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded">
                       Hidden
                     </span>
                  )}
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <h3 className="font-['Cinzel'] text-lg font-bold text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-300 line-clamp-2 mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {item.description}
                    </p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    <button 
                      onClick={() => openModal(item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-2 rounded hover:bg-[#D4AF37] transition-colors text-xs font-bold"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Placeholder */}
            <button 
              onClick={() => openModal()}
              className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 aspect-[4/5]"
            >
              <FiPlus className="text-3xl mb-2" />
              <span className="text-sm font-medium">Add Image</span>
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
              className="bg-[#121212] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <h2 className="font-['Cinzel'] text-xl text-white">
                  {editingItem ? 'Edit Media' : 'Upload New Media'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="galleryForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Image Preview */}
                  <div className="w-full aspect-video bg-black rounded-lg border border-white/10 overflow-hidden relative group">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <FiImage size={32} className="mb-2"/>
                        <span className="text-xs">No image selected</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Image URL</label>
                      <input
                        type="url"
                        name="image"
                        required
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Title</label>
                        <input
                          type="text"
                          name="title"
                          required
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none text-sm"
                          placeholder="e.g. Royal Wedding"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Category</label>
                        <div className="relative">
                          <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none appearance-none text-sm"
                          >
                            <option value="wedding">Wedding</option>
                            <option value="corporate">Corporate</option>
                            <option value="party">Party</option>
                            <option value="anniversary">Anniversary</option>
                            <option value="other">Other</option>
                          </select>
                          <FiTag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Description (Optional)</label>
                      <textarea
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none resize-none text-sm"
                        placeholder="Add a caption..."
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#1A1A1A] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Visible in Gallery</span>
                        <span className="text-xs text-gray-500">Uncheck to hide this image from users</span>
                      </div>
                    </label>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-white/10 bg-[#1A1A1A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 text-gray-400 hover:text-white transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="galleryForm"
                  className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors text-sm"
                >
                  {editingItem ? 'Save Changes' : 'Upload Image'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGallery;


