import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiMail, FiPhone, FiTrash2, FiCheckCircle, 
  FiX, FiCornerUpLeft, FiRefreshCw, FiFilter 
} from 'react-icons/fi';
import AdminNavbar from '../../components/admin/AdminNavbar';
import api from '../../utils/api';

const AdminContact = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, replied
  const [allEmails, setAllEmails] = useState([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
    fetchContacts();
    fetchAllEmails();
  }, [navigate]);

  const fetchAllEmails = async () => {
    try {
      // Fetch contact emails
      const contactResponse = await api.get('/admin/contact');
      const contactEmails = (contactResponse.data.data || []).map(c => c.email);
      
      // Fetch newsletter emails
      const subscribeResponse = await api.get('/admin/subscribe');
      const newsletterEmails = (subscribeResponse.data.data || [])
        .filter(sub => sub.isActive)
        .map(sub => sub.email);
      
      // Combine and deduplicate
      const emails = new Set([...contactEmails, ...newsletterEmails]);
      setAllEmails(Array.from(emails).sort());
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/contact');
      setContacts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e, contactId, type, value) => {
    e?.stopPropagation();
    try {
      await api.put(`/admin/contact/${contactId}`, { [type]: value });
      
      setContacts(prev => prev.map(c => 
        c._id === contactId ? { ...c, [type]: value } : c
      ));
      
      if (selectedContact?._id === contactId) {
        setSelectedContact(prev => ({ ...prev, [type]: value }));
      }
      
      toast.success(`Message marked as ${value ? (type === 'isRead' ? 'Read' : 'Replied') : (type === 'isRead' ? 'Unread' : 'Not Replied')}`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (e, id) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.delete(`/admin/contact/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      toast.success('Message deleted');
      if (selectedContact?._id === id) setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openMessage = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
    if (!contact.isRead) {
      handleAction(null, contact._id, 'isRead', true);
    }
  };

  // Filtering Logic
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !c.isRead :
      filter === 'replied' ? c.isReplied : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-3xl font-bold text-white">Inbox</h1>
            <p className="text-gray-400 mt-1">Customer inquiries and support messages.</p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Email Dropdown */}
            <div className="w-full sm:w-64">
              <select
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                onChange={(e) => {
                  if (e.target.value) {
                    window.open(`mailto:${e.target.value}`, '_blank');
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Select email (Contact + Newsletter)...</option>
                {allEmails.map((email, index) => (
                  <option key={index} value={email} className="bg-[#1A1A1A] text-white">
                    {email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative flex-1 sm:flex-none">
               <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search inbox..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full sm:w-64 bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
               />
             </div>
             
             <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-white/10">
                {['all', 'unread', 'replied'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-md text-sm capitalize transition-all ${
                      filter === f ? 'bg-[#D4AF37] text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
             
             <button 
               onClick={fetchContacts} 
               className="p-2.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
               title="Refresh"
             >
               <FiRefreshCw className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden min-h-[600px] shadow-2xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37]"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FiMail size={48} className="mb-4 opacity-30" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredContacts.map((contact) => (
                <div 
                  key={contact._id}
                  onClick={() => openMessage(contact)}
                  className={`group flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-[#1A1A1A] border-l-2 ${
                    !contact.isRead ? 'bg-[#1A1A1A]/30 border-[#D4AF37]' : 'bg-transparent border-transparent hover:border-white/10'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border transition-colors ${
                    !contact.isRead 
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                      : 'bg-gray-800 text-gray-400 border-white/5 group-hover:border-white/20'
                  }`}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className={`md:col-span-3 truncate ${!contact.isRead ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                      {contact.name}
                    </div>
                    
                    <div className="md:col-span-7 flex items-center gap-3 min-w-0">
                       {contact.isReplied && (
                         <span className="shrink-0 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold rounded border border-blue-500/20">
                           Replied
                         </span>
                       )}
                       <div className="truncate text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                         <span className={!contact.isRead ? 'text-white font-medium' : ''}>{contact.subject}</span>
                         <span className="mx-2 text-gray-600">-</span>
                         <span>{contact.message}</span>
                       </div>
                    </div>

                    <div className="md:col-span-2 text-right text-xs text-gray-500 font-mono">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Quick Actions (Hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                    <button 
                      onClick={(e) => handleAction(e, contact._id, 'isRead', !contact.isRead)}
                      className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-[#D4AF37] transition-colors"
                      title={contact.isRead ? "Mark Unread" : "Mark Read"}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full border ${contact.isRead ? 'border-current bg-transparent' : 'bg-current border-current'}`} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, contact._id)}
                      className="p-2 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reading Pane Modal */}
      <AnimatePresence>
        {isModalOpen && selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#121212] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(e, selectedContact._id)}
                    className="p-2 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors" 
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                  <button 
                    onClick={(e) => handleAction(e, selectedContact._id, 'isRead', !selectedContact.isRead)}
                    className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-[#D4AF37] transition-colors"
                    title={selectedContact.isRead ? "Mark Unread" : "Mark Read"}
                  >
                    <FiMail />
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/5">
                   <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#D4AF37]/20">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedContact.subject}</h2>
                        <div className="flex flex-col mt-1">
                          <span className="text-sm font-medium text-[#D4AF37]">{selectedContact.name}</span>
                          <span className="text-xs text-gray-400">&lt;{selectedContact.email}&gt;</span>
                        </div>
                      </div>
                   </div>
                   <div className="text-right text-xs text-gray-500 font-mono">
                      <p>{new Date(selectedContact.createdAt).toLocaleDateString()}</p>
                      <p>{new Date(selectedContact.createdAt).toLocaleTimeString()}</p>
                   </div>
                </div>

                {/* Message Body */}
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap mb-8">
                  {selectedContact.message}
                </div>

                {/* Contact Info Footer */}
                <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 mb-6">
                   <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Contact Details</h3>
                   <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <FiMail className="text-[#D4AF37]" /> {selectedContact.email}
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <FiPhone className="text-[#D4AF37]" /> {selectedContact.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        {selectedContact.isReplied ? (
                           <span className="text-blue-400 flex items-center gap-1"><FiCheckCircle /> Replied</span>
                        ) : (
                           <span className="text-gray-500">Pending Reply</span>
                        )}
                      </div>
                   </div>
                </div>

                {/* Reply Action Area */}
                <div className="flex gap-3">
                   <button 
                      onClick={() => window.open(`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#b5952f] transition-colors shadow-lg shadow-[#D4AF37]/10"
                   >
                     <FiCornerUpLeft /> Reply via Email
                   </button>
                   <button 
                      onClick={(e) => handleAction(e, selectedContact._id, 'isReplied', !selectedContact.isReplied)}
                      className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-colors font-medium ${
                        selectedContact.isReplied 
                          ? 'bg-transparent border-white/20 text-gray-400 hover:text-white' 
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                   >
                     {selectedContact.isReplied ? 'Mark as Unreplied' : 'Mark as Replied'}
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

export default AdminContact;


