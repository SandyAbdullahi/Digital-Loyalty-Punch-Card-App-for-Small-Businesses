import axios from 'axios';

// Set the base URL for all API requests
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';