const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🌐 Current hostname:', hostname);
  
  // Production domain
  if (hostname === 'themelissanyc.com' || hostname === 'www.themelissanyc.com') {
    return 'https://themelissa-backend.onrender.com';
  }
  
  // Localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Network IP (mobile testing)
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.0.0.')) {
    return `http://${hostname.replace(/192\.168\.\d+\.\d+/, '192.168.1.161')}:5000`;
  }
  
  // Fallback to environment variable or localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();

console.log('🔗 Using API URL:', API_URL);