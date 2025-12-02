

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiUsers, FiCalendar, FiDollarSign, FiSettings, 
  FiBarChart2, FiMapPin, FiBookOpen, FiMail, 
  FiArrowUpRight, FiClock, FiActivity 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    totalHalls: 0,
    totalServices: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    totalContacts: 0,
    unreadContacts: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchDashboardStats();
    }
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      console.log('📊 Fetching dashboard stats...');
      
      const response = await api.get('/admin/dashboard');
      console.log('📊 Dashboard response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
      
      const data = response.data.data || {};
      
      // Calculate total revenue
      let totalRevenue = 0;
      let bookings = [];
      try {
        const bookingsResponse = await api.get('/admin/bookings?status=confirmed');
        bookings = bookingsResponse.data.data || [];
        totalRevenue = bookings.reduce((sum, booking) => sum + (booking.paidAmount || 0), 0);
      } catch (error) {
        console.warn('Could not fetch bookings:', error);
      }

      // Recent bookings
      let recentBookingsData = [];
      try {
        const recentBookingsResponse = await api.get('/admin/bookings');
        recentBookingsData = (recentBookingsResponse.data.data || []).slice(0, 5);
        setRecentBookings(recentBookingsData);
      } catch (error) {
        console.warn('Could not fetch recent bookings:', error);
        setRecentBookings([]);
      }

      // Recent contacts
      let recentContactsData = [];
      try {
        const contactsResponse = await api.get('/admin/contact');
        recentContactsData = (contactsResponse.data.data || []).slice(0, 5);
        setRecentContacts(recentContactsData);
      } catch (error) {
        console.warn('Could not fetch contacts:', error);
        setRecentContacts([]);
      }

      const statsData = {
        totalEvents: data.bookings?.total || 0,
        totalUsers: 0,
        totalRevenue: totalRevenue,
        pendingBookings: data.bookings?.pending || 0,
        totalHalls: data.halls?.total || 0,
        totalServices: data.services?.total || 0,
        totalBlogs: data.blogs?.total || 0,
        publishedBlogs: data.blogs?.published || 0,
        totalContacts: data.contacts?.total || 0,
        unreadContacts: data.contacts?.unread || 0
      };

      console.log('📊 Final stats:', statsData);
      setStats(statsData);

      // Show info if database is empty
      if (statsData.totalHalls === 0 && statsData.totalServices === 0) {
        toast('Database is empty. Run seed script to add sample data.', {
          icon: 'ℹ️',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      toast.error(errorMessage);
      
      // Set default empty stats on error
      setStats({
        totalEvents: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        totalHalls: 0,
        totalServices: 0,
        totalBlogs: 0,
        publishedBlogs: 0,
        totalContacts: 0,
        unreadContacts: 0
      });
      setRecentBookings([]);
      setRecentContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Configuration for Stat Cards
  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: <FiDollarSign className="w-6 h-6" />, 
      gradient: 'from-amber-500 to-orange-600', 
      bg: 'bg-orange-500/10',
      textColor: 'text-amber-500'
    },
    { 
      title: 'Total Bookings', 
      value: stats.totalEvents, 
      icon: <FiCalendar className="w-6 h-6" />, 
      gradient: 'from-blue-500 to-cyan-600', 
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    { 
      title: 'Pending Actions', 
      value: stats.pendingBookings, 
      icon: <FiClock className="w-6 h-6" />, 
      gradient: 'from-rose-500 to-red-600', 
      bg: 'bg-rose-500/10',
      textColor: 'text-rose-400'
    },
    { 
      title: 'Venues & Halls', 
      value: stats.totalHalls, 
      icon: <FiMapPin className="w-6 h-6" />, 
      gradient: 'from-emerald-500 to-green-600', 
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Status: Operational
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg hover:bg-[#252525] transition-colors text-sm text-gray-300">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#b5952f] transition-colors text-sm">
              + New Booking
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-6 bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
                >
                  {/* Hover Gradient Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.textColor}`}>
                      {stat.icon}
                    </div>
                  </div>
                  
                  {/* Decorative Graph Line */}
                  <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full w-2/3 bg-gradient-to-r ${stat.gradient} rounded-full opacity-80`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Activity (Left Large Column) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-['Cinzel'] text-xl text-white flex items-center gap-2">
                      <FiActivity className="text-[#D4AF37]" /> Recent Bookings
                    </h2>
                    <button 
                      onClick={() => navigate('/admin/bookings')}
                      className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      View All <FiArrowUpRight />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <div 
                          key={booking._id} 
                          className="group flex items-center gap-4 p-4 bg-[#0A0A0A] hover:bg-[#161616] border border-white/5 rounded-xl transition-all duration-200"
                        >
                          <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-white/10 group-hover:border-[#D4AF37]/30 transition-colors">
                            <span className="text-lg font-bold text-[#D4AF37]">
                              {booking.eventName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{booking.eventName}</h4>
                            <p className="text-sm text-gray-400 truncate flex items-center gap-2">
                              {booking.hallId?.name || 'Venue N/A'} 
                              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No recent bookings found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Messages Section */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-['Cinzel'] text-xl text-white flex items-center gap-2">
                      <FiMail className="text-blue-400" /> Latest Inquiries
                    </h2>
                    <button 
                      onClick={() => navigate('/admin/messages')}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View Inbox
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentContacts.slice(0, 3).map((contact) => (
                      <div key={contact._id} className="flex items-start gap-4 p-3 hover:bg-[#1A1A1A] rounded-lg transition-colors">
                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="text-sm font-medium text-white">{contact.name}</h5>
                            <span className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{contact.subject}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats (Right Side Column) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                {/* Analytics Card */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-['Cinzel'] text-lg mb-4 text-white">System Overview</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Published Blogs', value: stats.publishedBlogs, icon: <FiBookOpen />, color: 'text-purple-400', bar: 'bg-purple-500' },
                      { label: 'Total Services', value: stats.totalServices, icon: <FiSettings />, color: 'text-pink-400', bar: 'bg-pink-500' },
                      { label: 'Unread Messages', value: stats.unreadContacts, icon: <FiMail />, color: 'text-red-400', bar: 'bg-red-500' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`${item.color}`}>{item.icon}</span>
                            <span className="text-sm text-gray-300">{item.label}</span>
                          </div>
                          <span className="font-bold text-white">{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.bar} w-[70%] rounded-full opacity-80`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action Card */}
                <div className="bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/30 rounded-2xl p-6 text-center relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/20 blur-3xl rounded-full pointer-events-none"></div>
                   <h3 className="text-lg font-bold text-[#D4AF37] mb-2">Need Help?</h3>
                   <p className="text-sm text-gray-300 mb-4">Check the documentation or contact support for admin issues.</p>
                   <button className="w-full py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#b5952f] transition-colors text-sm">
                     View Documentation
                   </button>
                </div>
              </motion.div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
