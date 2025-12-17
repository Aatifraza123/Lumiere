import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit2, FiTrash2, FiImage, FiEye, FiEyeOff, 
  FiTag, FiLayers, FiX, FiType, FiAlignLeft, FiCheck, FiUser,
  FiList, FiMinus 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    tags: [],
    isPublished: false,
    image: '',
    author: {
      name: '',
      title: '',
      bio: ''
    }
  });
  const [tagInput, setTagInput] = useState('');
  const [contentSections, setContentSections] = useState([
    { id: 1, type: 'heading', level: 1, text: '' },
    { id: 2, type: 'paragraph', text: '' }
  ]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/blog');
      
      if (response.data && response.data.data) {
        setBlogs(response.data.data);
      } else if (Array.isArray(response.data)) {
        setBlogs(response.data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load posts');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested author fields
    if (name.startsWith('author.')) {
      const authorField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          [authorField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = (e) => {
    e?.preventDefault();
    if (tagInput.trim()) {
      if (formData.tags.includes(tagInput.trim())) return;
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const generatedContent = generateContentFromSections();
      const submitData = {
        ...formData,
        content: generatedContent,
        tags: JSON.stringify(formData.tags),
        isPublished: formData.isPublished.toString(),
        author: JSON.stringify(formData.author)
      };

      if (editingBlog) {
        await api.put(`/admin/blog/${editingBlog._id}`, submitData);
        toast.success('Post updated successfully!');
      } else {
        await api.post('/admin/blog', submitData);
        toast.success('Post created successfully!');
      }

      closeModal();
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    }
  };

  const parseContentToSections = (content) => {
    if (!content) return [
      { id: 1, type: 'heading', level: 1, text: '' },
      { id: 2, type: 'paragraph', text: '' }
    ];
    
    // Try to parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const sections = [];
    let id = 1;
    
    Array.from(doc.body.children).forEach((el) => {
      if (el.tagName.match(/^H[1-6]$/)) {
        sections.push({
          id: id++,
          type: 'heading',
          level: parseInt(el.tagName[1]),
          text: el.textContent || ''
        });
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
        sections.push({
          id: id++,
          type: el.tagName === 'UL' ? 'bullet-list' : 'number-list',
          items: items
        });
      } else if (el.tagName === 'P') {
        sections.push({
          id: id++,
          type: 'paragraph',
          text: el.textContent || ''
        });
      }
    });
    
    return sections.length > 0 ? sections : [
      { id: 1, type: 'heading', level: 1, text: '' },
      { id: 2, type: 'paragraph', text: '' }
    ];
  };

  const generateContentFromSections = () => {
    let html = '';
    contentSections.forEach((section, index) => {
      if (section.type === 'heading') {
        const marginTop = index === 0 ? '' : ' style="margin-top: 2rem;"';
        html += `<h${section.level}${marginTop}>${section.text || ''}</h${section.level}>`;
      } else if (section.type === 'paragraph') {
        html += `<p style="margin-bottom: 1.5rem; line-height: 1.8;">${section.text || ''}</p>`;
      } else if (section.type === 'bullet-list') {
        html += '<ul style="margin: 1.5rem 0; padding-left: 2rem; list-style-type: disc;">';
        (section.items || []).forEach(item => {
          if (item.trim()) {
            html += `<li style="margin-bottom: 0.75rem; line-height: 1.8;">${item}</li>`;
          }
        });
        html += '</ul>';
      } else if (section.type === 'number-list') {
        html += '<ol style="margin: 1.5rem 0; padding-left: 2rem; list-style-type: decimal;">';
        (section.items || []).forEach(item => {
          if (item.trim()) {
            html += `<li style="margin-bottom: 0.75rem; line-height: 1.8;">${item}</li>`;
          }
        });
        html += '</ol>';
      }
    });
    return html;
  };

  const addContentSection = (type, afterId = null) => {
    const newSection = {
      id: Date.now(),
      type: type,
      ...(type === 'heading' ? { level: 2, text: '' } : {}),
      ...(type === 'paragraph' ? { text: '' } : {}),
      ...(type.includes('list') ? { items: [''] } : {})
    };
    
    setContentSections(prevSections => {
      if (afterId === null) {
        return [...prevSections, newSection];
      } else {
        const index = prevSections.findIndex(s => s.id === afterId);
        return [
          ...prevSections.slice(0, index + 1),
          newSection,
          ...prevSections.slice(index + 1)
        ];
      }
    });
  };

  const removeContentSection = (id) => {
    setContentSections(prevSections => {
      if (prevSections.length > 1) {
        return prevSections.filter(s => s.id !== id);
      }
      return prevSections;
    });
  };

  const updateContentSection = (id, updates) => {
    setContentSections(prevSections => 
      prevSections.map(s => 
        s.id === id ? { ...s, ...updates } : s
      )
    );
  };

  const updateListItem = (sectionId, itemIndex, value) => {
    setContentSections(prevSections => prevSections.map(s => {
      if (s.id === sectionId) {
        const newItems = [...(s.items || [])];
        newItems[itemIndex] = value;
        return { ...s, items: newItems };
      }
      return s;
    }));
  };

  const addListItem = (sectionId) => {
    setContentSections(prevSections => prevSections.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: [...(s.items || []), ''] };
      }
      return s;
    }));
  };

  const removeListItem = (sectionId, itemIndex) => {
    setContentSections(prevSections => prevSections.map(s => {
      if (s.id === sectionId) {
        const newItems = s.items.filter((_, i) => i !== itemIndex);
        return { ...s, items: newItems.length > 0 ? newItems : [''] };
      }
      return s;
    }));
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category || 'general',
        tags: blog.tags || [],
        isPublished: blog.isPublished || false,
        image: blog.image || '',
        author: {
          name: blog.author?.name || (typeof blog.author === 'string' ? blog.author : '') || '',
          title: blog.author?.title || '',
          bio: blog.author?.bio || ''
        }
      });
      setContentSections(parseContentToSections(blog.content));
    } else {
      setEditingBlog(null);
      setFormData({
        title: '', 
        content: '', 
        excerpt: '', 
        category: 'general', 
        tags: [], 
        isPublished: false, 
        image: '',
        author: {
          name: '',
          title: '',
          bio: ''
        }
      });
      setContentSections([
        { id: 1, type: 'heading', level: 1, text: '' },
        { id: 2, type: 'paragraph', text: '' }
      ]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setTagInput('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success('Post deleted');
      fetchBlogs();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Blog Management</h1>
            <p className="text-gray-400 mt-1">Write, edit, and publish content for your audience.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20"
          >
            <FiPlus className="text-lg" />
            <span>Write New Post</span>
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 h-full"
              >
                {/* Image Cover */}
                <div className="h-48 w-full bg-gradient-to-b from-[#1A1A1A] to-[#050505] relative overflow-hidden">
                  {blog.image ? (
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <FiImage className="text-4xl" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded border border-white/10">
                      {blog.category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold backdrop-blur-md flex items-center gap-1 border ${
                      blog.isPublished 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {blog.isPublished ? <><FiEye /> Published</> : <><FiEyeOff /> Draft</>}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-['Cinzel'] text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#D4AF37] transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                    {blog.excerpt || "No description provided."}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {blog.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                    <button 
                      onClick={() => openModal(blog)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Card */}
            <button 
              onClick={() => openModal()}
              className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 min-h-[400px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                 <FiPlus className="text-3xl" />
              </div>
              <span className="font-medium text-lg">Create New Post</span>
              <span className="text-sm opacity-60 mt-1">Share your latest updates</span>
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
              className="bg-[#121212] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <h2 className="font-['Cinzel'] text-xl text-white">
                  {editingBlog ? 'Edit Post' : 'New Article'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="blogForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Article Title</label>
                        <div className="relative">
                          <FiType className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-lg font-medium placeholder-gray-600"
                            placeholder="Enter a catchy headline..."
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-400 font-medium">Main Content</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addContentSection('heading')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                              title="Add Heading"
                            >
                              <FiType /> Heading
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentSection('paragraph')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                              title="Add Paragraph"
                            >
                              <FiAlignLeft /> Paragraph
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentSection('number-list')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                              title="Add Numbered List"
                            >
                              <FiList /> Numbered
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentSection('bullet-list')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                              title="Add Bullet List"
                            >
                              <FiList /> Bullets
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-6 bg-[#0A0A0A] border border-white/10 rounded-lg p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                          {contentSections.map((section, index) => (
                            <div key={section.id} className="group relative p-5 bg-[#050505] rounded-xl border-2 border-white/10 hover:border-[#D4AF37]/50 transition-all shadow-lg">
                              {/* Section Header */}
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm text-white uppercase font-bold tracking-wider">
                                    {section.type === 'heading' ? `H${section.level} Heading` : 
                                     section.type === 'paragraph' ? 'Paragraph' :
                                     section.type === 'number-list' ? 'Numbered List' :
                                     section.type === 'bullet-list' ? 'Bullet List' : section.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {section.type === 'heading' && (
                                    <select
                                      value={section.level}
                                      onChange={(e) => updateContentSection(section.id, { level: parseInt(e.target.value) })}
                                      className="bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-xs text-white"
                                    >
                                      <option value={1}>H1</option>
                                      <option value={2}>H2</option>
                                      <option value={3}>H3</option>
                                      <option value={4}>H4</option>
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeContentSection(section.id)}
                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                    title="Remove Section"
                                  >
                                    <FiMinus size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Section Content */}
                              {section.type === 'heading' && (
                                <div className="mt-4">
                                  <input
                                    type="text"
                                    value={section.text || ''}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      console.log('Heading input changed:', newValue);
                                      console.log('Section ID:', section.id);
                                      updateContentSection(section.id, { text: newValue });
                                    }}
                                    className={`w-full bg-[#1a1a1a] border-2 border-[#D4AF37]/50 rounded-lg px-5 py-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold placeholder-gray-500 ${
                                      section.level === 1 ? 'text-2xl' :
                                      section.level === 2 ? 'text-xl' :
                                      section.level === 3 ? 'text-lg' :
                                      'text-base'
                                    }`}
                                    placeholder={`Type your H${section.level} heading here...`}
                                    autoComplete="off"
                                  />
                                  {/* Debug info */}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Current value: "{section.text || 'empty'}" | ID: {section.id}
                                  </div>
                                </div>
                              )}

                              {section.type === 'paragraph' && (
                                <div className="mt-4">
                                  <textarea
                                    value={section.text || ''}
                                    onChange={(e) => updateContentSection(section.id, { text: e.target.value })}
                                    rows="4"
                                    className="w-full bg-[#0A0A0A] border-2 border-white/20 rounded-lg px-5 py-3 text-gray-300 focus:border-[#D4AF37] focus:outline-none resize-none text-base leading-relaxed"
                                    placeholder="Enter paragraph text..."
                                  />
                                </div>
                              )}

                              {(section.type === 'number-list' || section.type === 'bullet-list') && (
                                <div className="mt-4 space-y-3">
                                  {(section.items || ['']).map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-start gap-3 p-3 bg-[#0A0A0A] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                                      <span className="text-[#D4AF37] font-bold text-base mt-1 min-w-[32px] flex-shrink-0">
                                        {section.type === 'number-list' ? `${itemIndex + 1}.` : '•'}
                                      </span>
                                      <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem(section.id, itemIndex, e.target.value)}
                                        className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none text-base"
                                        placeholder={`List item ${itemIndex + 1}...`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeListItem(section.id, itemIndex)}
                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors flex-shrink-0"
                                        title="Remove Item"
                                      >
                                        <FiX size={14} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => addListItem(section.id)}
                                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg text-sm text-[#D4AF37] hover:text-white transition-colors font-medium"
                                  >
                                    <FiPlus size={14} /> Add New Item
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Excerpt / Summary</label>
                        <textarea
                          name="excerpt"
                          required
                          rows="3"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none resize-none text-sm"
                          placeholder="A short summary for previews (1-2 sentences)..."
                        />
                      </div>
                    </div>

                    {/* Sidebar Settings Column */}
                    <div className="space-y-6">
                      {/* Image Upload */}
                      <div className="space-y-2">
                         <label className="text-sm text-gray-400 font-medium">Cover Image URL</label>
                         <input 
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                         />
                         {formData.image && (
                           <div className="w-full h-32 rounded-lg overflow-hidden mt-2 border border-white/10">
                             <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                           </div>
                         )}
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Category</label>
                        <div className="relative">
                          <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#D4AF37] focus:outline-none appearance-none text-sm"
                          >
                            <option value="general">General</option>
                            <option value="wedding">Wedding Tips</option>
                            <option value="corporate">Corporate Events</option>
                            <option value="news">Company News</option>
                          </select>
                        </div>
                      </div>

                      {/* Author Section */}
                      <div className="space-y-3 p-4 bg-[#0A0A0A] border border-white/10 rounded-lg">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                          <FiUser className="text-[#D4AF37]" />
                          Author Information
                        </label>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Author Name</label>
                            <input
                              type="text"
                              name="author.name"
                              value={formData.author.name}
                              onChange={handleInputChange}
                              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                              placeholder="e.g. Sarah Jenkins"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Author Title</label>
                            <input
                              type="text"
                              name="author.title"
                              value={formData.author.title}
                              onChange={handleInputChange}
                              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                              placeholder="e.g. Senior Planner"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Author Bio</label>
                            <textarea
                              name="author.bio"
                              value={formData.author.bio}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none resize-none"
                              placeholder="e.g. Sarah is a luxury event planner with over 15 years of experience curating bespoke weddings across Europe and Asia. Her work has been featured in Vogue, Harper's Bazaar, and Brides Magazine."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                         <label className="text-sm text-gray-400 font-medium">Tags</label>
                         <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                              placeholder="Add tag..."
                              className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                            <button type="button" onClick={handleAddTag} className="px-3 bg-white/10 rounded-lg hover:bg-white/20"><FiPlus/></button>
                         </div>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tags.map((tag, i) => (
                              <span key={i} className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs px-2 py-1 rounded flex items-center gap-1">
                                {tag} <button type="button" onClick={() => handleRemoveTag(i)}><FiX size={10}/></button>
                              </span>
                            ))}
                         </div>
                      </div>

                      {/* Publish Toggle */}
                      <div className="pt-4 border-t border-white/10">
                         <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#1A1A1A] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isPublished ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                             {formData.isPublished && <FiCheck size={12} className="text-black" />}
                          </div>
                          <input
                            type="checkbox"
                            name="isPublished"
                            checked={formData.isPublished}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Publish Immediately</span>
                            <span className="text-xs text-gray-500">Make visible to public</span>
                          </div>
                        </label>
                      </div>

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
                  form="blogForm"
                  className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/10"
                >
                  {editingBlog ? 'Save Updates' : 'Publish Article'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlog;


