import axios from 'axios';

// Set the base URL for all API requests
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  'https://digital-loyalty-punch-card-app-for-small.onrender.com';
