import axios from 'axios';

// Base API configuration
const API_URL = 'https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net';

// Create axios instance for search-related endpoints (no authentication required)
const searchApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default searchApi;