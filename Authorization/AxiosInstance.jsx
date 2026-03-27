import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// ✅ Request interceptor - add token to Authorization header
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token'); // retrieve stored JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // add token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - handle errors like 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized - token may be invalid or expired');
        // Optional: redirect to login
      } else {
        console.log('API error:', error.response.status, error.response.data);
      }
    } else {
      console.log('Network or server error', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
