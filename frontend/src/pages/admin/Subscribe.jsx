import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import DOMPurify from 'dompurify'; // For sanitizing HTML
import { 
  FiMail, FiUser, FiCheckCircle, FiXCircle, FiTrash2, 
  FiDownload, FiSend, FiX, FiSearch, FiEye, FiChevronLeft, 
  FiChevronRight, FiCheckSquare, FiSquare 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const ITEMS_PER_PAGE = 10;

// Quill modules configuration for the toolbar
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }]
  ],
};

const AdminSubscribe = () => {
  const navigate = useNavigate();
  
  // Data States
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Filter & Search States
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Newsletter States
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    content: '' // Now stores HTML string
  });

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('adminAuthenticated');
      if (!isAuthenticated) navigate('/admin/login');
    };
    checkAuth();
    fetchSubscriptions();
  }, [navigate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/subscribe');
      
      let data = [];
      if (Array.isArray(response.data)) data = response.data;
      else if (Array.isArray(response.data?.data)) data = response.data.data;
      else if (Array.isArray(response.data?.subscriptions)) data = response.data.subscriptions;
      
      setSubscriptions(data);
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesFilter = 
        filter === 'all' ? true :
        filter === 'active' ? sub.isActive :
        !sub.isActive;
      
      const matchesSearch = 
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [subscriptions, filter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedSubscriptions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSubscriptions.map(s => s._id)));
    }
  };

  const toggleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} subscriptions?`)) return;
    
    try {
      // In a real app, you'd probably want a bulk delete endpoint
      // Here we'll just loop for simplicity (optimize for production!)
      await Promise.all([...selectedIds].map(id => api.delete(`/admin/subscribe/${id}`)));
      
      toast.success('Selected subscriptions deleted');
      setSelectedIds(new Set());
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete some subscriptions');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    try {
      await api.delete(`/admin/subscribe/${id}`);
      toast.success('Deleted successfully');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? subscriptions.filter(s => selectedIds.has(s._id))
      : filteredSubscriptions;

    const csv = [
      ['Email', 'Name', 'Status', 'Subscribed At'],
      ...dataToExport.map(sub => [
        sub.email,
        sub.name || 'N/A',
        sub.isActive ? 'Active' : 'Inactive',
        new Date(sub.subscribedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export successful!');
  };

  const handleSendNewsletter = async () => {
    if (!newsletterForm.subject.trim()) return toast.error('Subject is required');
    
    // Check for empty Quill content (Quill leaves <p><br></p> when empty)
    if (!newsletterForm.content || newsletterForm.content === '<p><br></p>') {
      return toast.error('Content is required');
    }

    // Sanitize HTML content before sending
    const sanitizedContent = DOMPurify.sanitize(newsletterForm.content);
    
    if (!window.confirm('Ready to send this newsletter to all active subscribers?')) return;

    setSendingNewsletter(true);
    try {
      const response = await api.post('/admin/subscribe/send-newsletter', {
        subject: newsletterForm.subject.trim(),
        content: sanitizedContent,
        sendToAll: true
      });

      if (response.data.success) {
        toast.success(`Sent to ${response.data.data?.sent || 'subscribers'}!`);
        setShowNewsletterModal(false);
        setNewsletterForm({ subject: '', content: '' });
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error(error.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setSendingNewsletter(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#D4AF37]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold">Subscribers</h1>
            <p className="text-gray-400 mt-1">Manage your newsletter audience and campaigns.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewsletterModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black rounded-lg hover:bg-[#b5952f] transition-all font-bold shadow-lg shadow-[#D4AF37]/20 active:scale-95"
            >
              <FiSend /> <span>New Campaign</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all font-medium"
            >
              <FiDownload /> <span>Export</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
            >
              <span className="text-sm text-red-400 font-medium">{selectedIds.size} selected</span>
              <button 
                onClick={handleBulkDelete}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Delete Selected
              </button>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#1A1A1A]">
                  <th className="p-4 w-12">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white">
                      {selectedIds.size === paginatedSubscriptions.length && paginatedSubscriptions.length > 0 
                        ? <FiCheckSquare size={20} className="text-[#D4AF37]" />
                        : <FiSquare size={20} />
                      }
                    </button>
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Subscriber</th>
                  <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="p-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedSubscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <button onClick={() => toggleSelectOne(sub._id)} className="text-gray-500 hover:text-[#D4AF37]">
                        {selectedIds.has(sub._id) 
                          ? <FiCheckSquare size={20} className="text-[#D4AF37]" /> 
                          : <FiSquare size={20} />
                        }
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#D4AF37]">
                          <FiUser />
                        </div>
                        <div>
                          <div className="font-medium text-white">{sub.email}</div>
                          <div className="text-xs text-gray-500">{sub.name || 'Guest User'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {sub.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <FiCheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <FiXCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Subscription"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <FiMail className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No subscribers found matching your criteria.</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
             <div className="border-t border-white/10 p-4 flex items-center justify-between bg-[#1A1A1A]">
               <span className="text-sm text-gray-400">
                 Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubscriptions.length)} of {filteredSubscriptions.length}
               </span>
               <div className="flex gap-2">
                 <button 
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage(p => p - 1)}
                   className="p-2 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <FiChevronLeft />
                 </button>
                 {[...Array(totalPages)].map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                       currentPage === i + 1 
                         ? 'bg-[#D4AF37] text-black' 
                         : 'hover:bg-white/10 text-gray-400'
                     }`}
                   >
                     {i + 1}
                   </button>
                 ))}
                 <button 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(p => p + 1)}
                   className="p-2 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <FiChevronRight />
                 </button>
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {showNewsletterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121212] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <h2 className="font-['Cinzel'] text-xl text-white">Compose Newsletter</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:bg-white/10'}`}
                    title="Toggle Preview"
                  >
                    <FiEye size={20} />
                  </button>
                  <button onClick={() => setShowNewsletterModal(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Editor Side */}
                <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 ${showPreview ? 'hidden md:flex' : 'flex'}`}>
                   <div className="space-y-2">
                     <label className="text-sm text-gray-400 font-medium">Subject Line</label>
                     <input
                       type="text"
                       value={newsletterForm.subject}
                       onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                       className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none font-medium"
                       placeholder="e.g., Exclusive Offer for You!"
                     />
                   </div>
                   
                   <div className="flex-1 flex flex-col space-y-2 min-h-[300px]">
                     <label className="text-sm text-gray-400 font-medium">Email Content</label>
                     <div className="flex-1 bg-[#0A0A0A] rounded-lg overflow-hidden border border-white/10 focus-within:border-[#D4AF37]">
                       <ReactQuill 
                         theme="snow"
                         value={newsletterForm.content}
                         onChange={(content) => setNewsletterForm({ ...newsletterForm, content })}
                         modules={quillModules}
                         className="h-full text-white"
                         placeholder="Write your masterpiece..."
                       />
                     </div>
                     <style>{`
                       .ql-toolbar { border-color: rgba(255,255,255,0.1) !important; background: #1A1A1A; }
                       .ql-container { border: none !important; font-size: 16px; }
                       .ql-editor { min-height: 200px; color: #e5e5e5; }
                       .ql-picker { color: #ccc; }
                       .ql-stroke { stroke: #ccc !important; }
                       .ql-fill { fill: #ccc !important; }
                     `}</style>
                   </div>
                </div>

                {/* Preview Side (Conditional) */}
                {showPreview && (
                  <div className="flex-1 bg-white p-8 overflow-y-auto border-l border-white/10 text-black">
                    <div className="max-w-[600px] mx-auto">
                      <h1 className="text-2xl font-bold mb-2 text-gray-900 border-b pb-4 border-gray-200">
                        {newsletterForm.subject || 'No Subject'}
                      </h1>
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(newsletterForm.content || '<p class="text-gray-500 italic">Start typing to see preview...</p>') 
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-[#1A1A1A] flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Sending to <span className="text-[#D4AF37] font-bold">{subscriptions.filter(s => s.isActive).length}</span> active subscribers
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewsletterModal(false)}
                    className="px-5 py-2.5 text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendNewsletter}
                    disabled={sendingNewsletter}
                    className="px-6 py-2.5 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-all shadow-lg shadow-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingNewsletter ? (
                      <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><FiSend /> Send Blast</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscribe;


