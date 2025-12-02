import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMail, FiUser, FiCheckCircle, FiXCircle, FiTrash2, FiDownload } from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminSubscribe = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
      const params = new URLSearchParams();
      if (filter === 'active') params.append('isActive', 'true');
      if (filter === 'inactive') params.append('isActive', 'false');

      const response = await api.get(`/admin/subscribe?${params.toString()}`);
      setSubscriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions');
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
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl hover:bg-[#C5A028] transition-all font-semibold"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <div className="ml-auto text-sm text-gray-400">
              Total: <span className="text-white font-semibold">{subscriptions.length}</span>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Subscribed At</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <span>{subscription.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {subscription.name ? (
                        <div className="flex items-center gap-2">
                          <FiUser className="text-gray-400" />
                          <span>{subscription.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {subscription.isActive ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <FiCheckCircle />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
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
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all"
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
          <div className="text-center py-12 text-gray-400">
            <p>No subscriptions found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSubscribe;

