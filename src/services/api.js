import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000, // 15 seconds timeout for Render cold starts
  timeoutErrorMessage: 'Request timeout. Backend may be starting up. Please try again in a moment.'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors with user-friendly messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. The backend server may be starting up. Please wait 30-60 seconds and try again.',
        isTimeout: true
      });
    }
    
    // Network error (no response from server)
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection and ensure the backend server is running.',
        isNetworkError: true
      });
    }
    
    // Server responded with error status
    const message = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => {
    console.log('🔧 taskAPI.updateTask called with:', { id, taskData });
    return api.put(`/tasks/${id}`, taskData);
  },
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};

export const habitAPI = {
  getHabits: () => api.get('/habits'),
  createHabit: (habitData) => api.post('/habits', habitData),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  generateDailyTasks: () => api.post('/habits/generate-daily')
};

export const petAPI = {
  getPet: () => api.get('/pet'),
  createPet: (petData) => api.post('/pet', petData),
  feedPet: (foodId) => api.post('/pet/feed', { foodId }),
  playWithPet: (toyId) => api.post('/pet/play', { toyId }),
  buyItem: (itemId, itemType) => api.post('/pet/buy', { itemId, itemType }),
  equipClothes: (itemId, slot) => api.post('/pet/equip', { itemId, slot }),
  getShop: () => api.get('/pet/shop'),
  renamePet: (name) => api.put('/pet/name', { name })
};

export default api;
