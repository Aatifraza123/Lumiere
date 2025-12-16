import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 second timeout for cold starts on free hosting
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Handle response errors with retry logic
api.interceptors.response.use(
  (response) => {
    // Log successful API calls in development
    if (import.meta.env.DEV) {
      console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url} - Success`);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Check if we should retry
    const shouldRetry = 
      config.__retryCount < MAX_RETRIES &&
      (error.code === 'ECONNABORTED' || // Timeout
       error.code === 'ERR_NETWORK' || // Network error
       !error.response); // No response (server down/sleeping)
    
    if (shouldRetry) {
      config.__retryCount += 1;
      
      console.warn(`⚠️ Retrying request (${config.__retryCount}/${MAX_RETRIES}): ${config.url}`);
      console.warn(`⚠️ Reason: ${error.message}`);
      
      // Wait before retrying
      await delay(RETRY_DELAY * config.__retryCount);
      
      // Retry the request
      return api(config);
    }
    
    // Handle network errors gracefully
    if (!error.response) {
      // Network error - backend might be down or sleeping
      console.error('❌ Network error - backend may be unavailable or starting up');
      console.error('❌ Request URL:', error.config?.url);
      console.error('❌ Error:', error.message);
      console.error('💡 Tip: If using Render free tier, the server may be sleeping. Please wait 30-60 seconds and try again.');
      return Promise.reject(error);
    }
    
    // Log API errors
    console.error(`❌ API ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error ${error.response.status}`);
    console.error('❌ Error response:', error.response.data);
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token but don't redirect automatically
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      console.warn('⚠️ Authentication token cleared. Please login again.');
    }
    
    // Always reject to allow components to handle errors
    return Promise.reject(error);
  }
);

export default api;

