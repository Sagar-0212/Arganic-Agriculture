import axios from 'axios';

// Create central axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies automatically
});

// Request Interceptor: Attach token if it is stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request has not been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh token endpoint
        const response = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const token = response.data?.token;
        
        if (!token) throw new Error('No token returned');
        
        // Save new token and update header
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth state on fail
        localStorage.removeItem('token');
        // Do not force redirect automatically as redux needs to synchronize, but propagate the error
        return Promise.reject(refreshError);
      }
    }
    
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
