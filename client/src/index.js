import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // or your global styles
import { AuthProvider } from './hooks/useAuth'; // Import the provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Global session handling wrapper */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);