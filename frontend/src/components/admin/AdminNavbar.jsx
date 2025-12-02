import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiCalendar, 
  FiMapPin, 
  FiSettings, 
  FiImage, 
  FiBookOpen, 
  FiMail, 
  FiUsers,
  FiMessageSquare,
  FiLogOut
} from 'react-icons/fi';

const AdminNavbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/admin/bookings', label: 'Bookings', icon: <FiCalendar /> },
    { path: '/admin/halls', label: 'Venues', icon: <FiMapPin /> },
    { path: '/admin/services', label: 'Services', icon: <FiSettings /> },
    { path: '/admin/gallery', label: 'Gallery', icon: <FiImage /> },
    { path: '/admin/blog', label: 'Blog', icon: <FiBookOpen /> },
    { path: '/admin/testimonials', label: 'Testimonials', icon: <FiMessageSquare /> },
    { path: '/admin/contact', label: 'Contact', icon: <FiMail /> },
    { path: '/admin/subscribe', label: 'Newsletter', icon: <FiUsers /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  return (
    <nav className="bg-[#111] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="font-['Cinzel'] text-xl text-[#D4AF37]">
              Admin Panel
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all text-sm"
          >
            <FiLogOut />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

