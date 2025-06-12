import axios, { AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Token storage key
const TOKEN_KEY = 'auth_token';

// Base API configuration
const API_URL = 'http://localhost:5222';

// Create axios instance
const baseApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically add the bearer token to headers
baseApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to set auth token for all future requests (for backward compatibility)
export const setAuthToken = (token: string | null) => {
  if (token) {
    baseApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete baseApi.defaults.headers.common['Authorization'];
  }
};

export default baseApi;