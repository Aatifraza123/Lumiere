import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMail, FiUser, FiCheckCircle, FiXCircle, FiTrash2, FiDownload, FiSend, FiX } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminSubscribe = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    checkAuth();
    fetchSubscriptions();
  }, [filter]);

  const checkAuth = () => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'active') params.append('isActive', 'true');
      if (filter === 'inactive') params.append('isActive', 'false');

      console.log('📥 Fetching subscriptions with filter:', filter);
      const response = await api.get(`/admin/subscribe?${params.toString()}`);
      console.log('📦 Subscriptions response:', response.data);
      
      let subscriptionsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          subscriptionsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          subscriptionsData = response.data.data;
        } else if (response.data.subscriptions && Array.isArray(response.data.subscriptions)) {
          subscriptionsData = response.data.subscriptions;
        }
      }
      
      console.log('✅ Subscriptions loaded:', subscriptionsData.length);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error(error.response?.data?.message || 'Failed to fetch subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;

    try {
      await api.delete(`/admin/subscribe/${id}`);
      toast.success('Subscription deleted successfully!');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Email', 'Name', 'Status', 'Subscribed At'],
      ...subscriptions.map(sub => [
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
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscriptions exported successfully!');
  };

  const handleSendNewsletter = async () => {
    if (!newsletterForm.subject || !newsletterForm.subject.trim()) {
      toast.error('Please enter email subject');
      return;
    }
    if (!newsletterForm.content || !newsletterForm.content.trim()) {
      toast.error('Please enter email content');
      return;
    }

    const activeSubscribers = subscriptions.filter(sub => sub.isActive);
    if (activeSubscribers.length === 0) {
      toast.error('No active subscribers found');
      return;
    }

    if (!window.confirm(`Send newsletter to ${activeSubscribers.length} active subscribers?`)) {
      return;
    }

    setSendingNewsletter(true);
    try {
      const response = await api.post('/admin/subscribe/send-newsletter', {
        subject: newsletterForm.subject.trim(),
        content: newsletterForm.content.trim(),
        sendToAll: true
      });

      if (response.data.success) {
        toast.success(`Newsletter sent to ${response.data.data.sent} subscribers!`);
        setShowNewsletterModal(false);
        setNewsletterForm({ subject: '', content: '' });
        
        if (response.data.data.failed > 0) {
          toast.error(`${response.data.data.failed} emails failed to send`);
        }
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error(error.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setSendingNewsletter(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] text-white min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      {/* Navigation Bar */}
      <AdminNavbar />
      
      {/* Header */}
      <header className="bg-[#111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-['Cinzel'] text-2xl">Newsletter Subscriptions</h1>
            <p className="text-sm text-gray-400">Manage newsletter subscribers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewsletterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg shadow-blue-500/25"
            >
              <FiSend />
              <span>Send Newsletter</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 font-semibold"
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-white">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="all" className="bg-[#0A0A0A] text-white">All Subscriptions</option>
              <option value="active" className="bg-[#0A0A0A] text-white">Active Only</option>
              <option value="inactive" className="bg-[#0A0A0A] text-white">Inactive Only</option>
            </select>
            <div className="ml-auto flex items-center gap-4 text-sm">
              <div className="text-gray-300">
                Active: <span className="text-emerald-400 font-semibold">
                  {subscriptions.filter(sub => sub.isActive).length}
                </span>
              </div>
              <div className="text-gray-300">
                Total: <span className="text-white font-semibold">{subscriptions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#1A1A1A]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Subscribed At</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <span className="text-white">{subscription.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {subscription.name ? (
                        <div className="flex items-center gap-2">
                          <FiUser className="text-gray-400" />
                          <span className="text-white">{subscription.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {subscription.isActive ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs border border-emerald-500/30">
                          <FiCheckCircle />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs border border-gray-500/30">
                          <FiXCircle />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(subscription.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(subscription._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg transition-all duration-300"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {subscriptions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-300">No subscriptions found.</p>
          </div>
        )}
      </main>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {showNewsletterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#1A1A1A] to-[#121212]">
                <h2 className="font-['Cinzel'] text-xl text-white">Send Newsletter</h2>
                <button 
                  onClick={() => setShowNewsletterModal(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 font-medium mb-2">
                      Recipients
                    </label>
                    <div className="bg-[#0A0A0A] border border-cyan-500/30 rounded-lg px-4 py-3 text-sm text-cyan-400">
                      {subscriptions.filter(sub => sub.isActive).length} active subscribers
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 font-medium mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newsletterForm.subject}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                      placeholder="Newsletter Subject"
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 font-medium mb-2">
                      Content <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={newsletterForm.content}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                      placeholder="Write your newsletter content here..."
                      rows={12}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none resize-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      You can use line breaks. HTML formatting will be preserved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-[#1A1A1A] to-[#121212] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewsletterModal(false);
                    setNewsletterForm({ subject: '', content: '' });
                  }}
                  className="px-5 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendNewsletter}
                  disabled={sendingNewsletter || !newsletterForm.subject.trim() || !newsletterForm.content.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600"
                >
                  {sendingNewsletter ? 'Sending...' : 'Send Newsletter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscribe;


