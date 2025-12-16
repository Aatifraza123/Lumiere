import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/layout/Footer';
import FloatingNav from './components/layout/FloatingNav';
import Loader from './components/Loader';
import PageTransition from './components/PageTransition';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Halls from './pages/Halls';
import HallDetail from './pages/HallDetail';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Book from './pages/Book';
import QuickBook from './pages/QuickBook';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import CancellationPolicy from './pages/CancellationPolicy';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminHalls from './pages/admin/Halls';
import AdminServices from './pages/admin/Services';
import AdminBookings from './pages/admin/Bookings';
import AdminBlog from './pages/admin/Blog';
import AdminContact from './pages/admin/Contact';
import AdminSubscribe from './pages/admin/Subscribe';
import AdminGallery from './pages/admin/Gallery';
import AdminTestimonials from './pages/admin/Testimonials';

// Loading Component
const LoadingFallback = () => <Loader fullScreen={true} />;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuthenticated');
    setIsAuthenticated(adminAuth === 'true');
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Component to conditionally show/hide header and footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const shouldAnimate = ['/services', '/halls', '/blog', '/services/', '/halls/', '/blog/'].some(path => 
    location.pathname === path || location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] overflow-x-hidden" style={{ width: '100%', maxWidth: '100vw', margin: 0, padding: 0 }}>
      {!isAdminRoute && <FloatingNav />}
      <main className="flex-grow overflow-x-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        {shouldAnimate ? (
          <PageTransition>{children}</PageTransition>
        ) : (
          children
        )}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app load
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (appLoading) {
    return <Loader fullScreen={true} />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#D4AF37',
                secondary: '#000',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/halls" element={<Halls />} />
                <Route path="/halls/:id" element={<HallDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/book" element={<Book />} />
                <Route path="/quick-book" element={<QuickBook />} />
                
                {/* Policy Pages */}
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/halls"
                  element={
                    <ProtectedRoute>
                      <AdminHalls />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute>
                      <AdminServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute>
                      <AdminBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/blog"
                  element={
                    <ProtectedRoute>
                      <AdminBlog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/contact"
                  element={
                    <ProtectedRoute>
                      <AdminContact />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/subscribe"
                  element={
                    <ProtectedRoute>
                      <AdminSubscribe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/gallery"
                  element={
                    <ProtectedRoute>
                      <AdminGallery />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/testimonials"
                  element={
                    <ProtectedRoute>
                      <AdminTestimonials />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
