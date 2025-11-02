import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './config/api'; // Import API configuration
import { AuthProvider } from './contexts/AuthContext';
import './styles/rudi-theme.css';
import './styles/util.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
