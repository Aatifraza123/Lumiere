import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiFilter, FiCalendar, FiUser, FiMapPin, 
  FiClock, FiEye, FiMoreVertical, FiX, FiCheck, FiDownload, FiDollarSign 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: ''
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchBookings();
  }, [filters, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      
      console.log('📥 Fetching bookings from:', `/admin/bookings?${params.toString()}`);
      const response = await api.get(`/admin/bookings?${params.toString()}`);
      console.log('📦 Bookings response:', response.data);
      
      // Handle different response formats
      let bookingsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          bookingsData = response.data.data;
        } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
          bookingsData = response.data.bookings;
        }
      }
      
      console.log('✅ Bookings loaded:', bookingsData.length);
      setBookings(bookingsData);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}`, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePaymentUpdate = async (bookingId, newPaymentStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}`, { paymentStatus: newPaymentStatus });
      toast.success(`Payment marked as ${newPaymentStatus}`);
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const openModal = async (booking) => {
    try {
      const response = await api.get(`/admin/bookings/${booking._id}`);
      setSelectedBooking(response.data.data);
      setShowDetails(true);
    } catch (error) {
      toast.error('Could not load booking details');
    }
  };

  const handleDownloadInvoice = async () => {
    if (!selectedBooking || !selectedBooking.invoiceNumber) {
      toast.error('Invoice not available for this booking');
      return;
    }

    try {
      const response = await api.get(`/admin/bookings/${selectedBooking._id}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${selectedBooking.invoiceNumber}.pdf`);
      if (document.body) {
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  // Status Badge Components
  const StatusBadge = ({ status, type }) => {
    const config = {
      confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
      refunded: 'bg-red-500/10 text-red-400 border-red-500/20',
      completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config[status] || 'bg-gray-800 text-gray-400'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredBookings = bookings.filter(b => 
    b.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Booking Management</h1>
            <p className="text-gray-400 mt-1">Track, manage, and update all event reservations.</p>
          </div>
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search events or emails..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select 
                value={filters.paymentStatus}
                onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="">Payment: All</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37]"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-lg mb-2">No bookings found</div>
              <div className="text-gray-600 text-sm">
                {filters.status || filters.paymentStatus 
                  ? 'Try adjusting your filters or check back later.' 
                  : 'Bookings will appear here once customers make reservations.'}
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No bookings found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-6 py-4">Event Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-[#181818] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {booking.eventName && booking.eventName.includes(' - ') 
                            ? booking.eventName.split(' - ')[0] 
                            : booking.eventName || 'Event'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FiMapPin size={10} /> {booking.hallId?.name || 'Unknown Venue'}
                        </div>
                        {booking.eventType && (
                          <div className="text-xs text-gray-500 mt-1 capitalize">
                            Service: {booking.eventType}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{booking.customerName || booking.userId?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{booking.customerEmail || booking.userId?.email}</div>
                        {booking.customerMobile && (
                          <div className="text-xs text-gray-500 mt-1">{booking.customerMobile}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FiClock size={10} /> {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">₹{booking.totalAmount?.toLocaleString()}</div>
                        <div className="mt-1"><StatusBadge status={booking.paymentStatus} /></div>
                      </td>
                      <td className="px-6 py-4">
                         <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openModal(booking)}
                          className="text-gray-400 hover:text-[#D4AF37] p-2 hover:bg-white/5 rounded-lg transition-all"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetails && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] w-full max-w-3xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#1A1A1A]">
                <div>
                  <h2 className="text-xl font-bold font-['Cinzel'] text-white">Booking Details</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedBooking._id}</p>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
                {/* Left Column: Info */}
                <div className="space-y-6">
                  {/* Event Info */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Event Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg"><FiCalendar /></div>
                        <div>
                          <p className="text-sm text-gray-400">Event Name</p>
                          <p className="font-medium text-white">
                            {selectedBooking.eventName && selectedBooking.eventName.includes(' - ') 
                              ? selectedBooking.eventName.split(' - ')[0] 
                              : selectedBooking.eventName || 'Event'}
                          </p>
                          {selectedBooking.eventType && (
                            <p className="text-xs text-gray-500 mt-1 capitalize">
                              Service: {selectedBooking.eventType}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><FiMapPin /></div>
                        <div>
                          <p className="text-sm text-gray-400">Venue & Location</p>
                          <p className="font-medium text-white">{selectedBooking.hallId?.name}</p>
                          <p className="text-xs text-gray-500">{selectedBooking.hallId?.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Customer Details</h3>
                    <div className="bg-[#0A0A0A] p-4 rounded-lg border border-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white">{selectedBooking.customerName || selectedBooking.userId?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white">{selectedBooking.customerEmail || selectedBooking.userId?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Phone</span>
                        <span className="text-white">{selectedBooking.customerMobile || selectedBooking.userId?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Financials & Actions */}
                <div className="space-y-6">
                   {/* Financial Summary */}
                   <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Financial Summary</h3>
                    <div className="bg-[#1A1A1A] p-4 rounded-lg border border-white/5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Base Price</span>
                        <span>₹{selectedBooking.basePrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Add-ons</span>
                        <span>₹{selectedBooking.addonsTotal?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tax</span>
                        <span>₹{selectedBooking.tax?.toLocaleString() || 0}</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-[#D4AF37]">₹{selectedBooking.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Paid</span>
                        <span>- ₹{selectedBooking.paidAmount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm text-orange-400 font-medium">
                        <span>Balance Due</span>
                        <span>₹{((selectedBooking.totalAmount || 0) - (selectedBooking.paidAmount || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                   </div>

                   {/* Admin Actions */}
                   <div>
                     <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Quick Actions</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <select 
                          value={selectedBooking.status}
                          onChange={(e) => handleStatusUpdate(selectedBooking._id, e.target.value)}
                          className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none w-full"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm Booking</option>
                          <option value="cancelled">Cancel Booking</option>
                          <option value="completed">Mark Complete</option>
                        </select>

                        <select 
                          value={selectedBooking.paymentStatus}
                          onChange={(e) => handlePaymentUpdate(selectedBooking._id, e.target.value)}
                          className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none w-full"
                        >
                          <option value="pending">Unpaid</option>
                          <option value="partial">Partial Pay</option>
                          <option value="paid">Mark Paid</option>
                          <option value="refunded">Refund</option>
                        </select>
                     </div>
                     
                     <button 
                        onClick={handleDownloadInvoice}
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg text-sm transition-colors border border-white/5 cursor-pointer"
                      >
                        <FiDownload /> Download Invoice
                     </button>
                   </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;


