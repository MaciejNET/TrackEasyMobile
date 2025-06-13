import axios, { AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

const API_URL = 'https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net';

const baseApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
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

export const setAuthToken = (token: string | null) => {
  if (token) {
    baseApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete baseApi.defaults.headers.common['Authorization'];
  }
};

export default baseApi;
