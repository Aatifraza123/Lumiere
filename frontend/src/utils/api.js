import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout (Render free tier can be slow)
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    // Check for admin token first, then regular token
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    const authToken = adminToken || token;
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    // Log successful API calls in development
    if (import.meta.env.DEV) {
      console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url} - Success`);
    }
    return response;
  },
  (error) => {
    // Handle network errors gracefully
    if (!error.response) {
      // Network error - backend might be down
      console.error('❌ Network error - backend may be unavailable');
      console.error('❌ Request URL:', error.config?.url);
      console.error('❌ Error:', error.message);
      return Promise.reject(error);
    }
    
    // Log API errors
    console.error(`❌ API ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error ${error.response.status}`);
    console.error('❌ Error response:', error.response.data);
    
    // Only handle 401 errors, ignore network errors and other errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token but don't redirect automatically
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    }
    // Always reject to allow components to handle errors
    return Promise.reject(error);
  }
);

export default api;

