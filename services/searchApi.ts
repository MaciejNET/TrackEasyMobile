import axios from 'axios';


const API_URL = 'https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net';


const searchApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default searchApi;