import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component that wraps your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL - adjust if your backend runs on different port
  const API_BASE_URL = 'http://localhost:5000/api';

  // Check for existing token when app loads
  useEffect(() => {
    console.log('AuthContext: Initializing authentication...');
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('AuthContext: Found existing token, verifying...');
      verifyToken(token);
    } else {
      console.log('AuthContext: No existing token found');
      setLoading(false);
    }
  }, []);

  // Verify if stored token is still valid
  const verifyToken = async (token) => {
    try {
      console.log('AuthContext: Verifying token with backend...');
      
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Token valid, user authenticated:', data.user.username);
        setUser(data.user);
      } else {
        console.log('AuthContext: Token invalid, removing from storage');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('AuthContext: Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login for email:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('AuthContext: Login successful for user:', data.user.username);
        console.log('AuthContext: User role:', data.user.role);
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Update user state
        setUser(data.user);
        
        return { success: true, user: data.user };
      } else {
        console.log('AuthContext: Login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your internet connection.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext: Logging out user:', user?.username);
    localStorage.removeItem('token');
    setUser(null);
    
    // Optional: Redirect to home page after logout
    window.location.href = '/';
  };

  // Check if current user is admin
  const isAdmin = () => {
    const result = user?.role === 'admin';
    console.log('AuthContext: isAdmin check:', result, 'for user:', user?.username);
    return result;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const result = !!user;
    console.log('AuthContext: isAuthenticated check:', result);
    return result;
  };

  // Get authorization header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Make authenticated API requests
  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // If token expired, logout user
      if (response.status === 401) {
        console.log('AuthContext: Token expired, logging out user');
        logout();
        return { success: false, message: 'Session expired. Please login again.' };
      }

      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status,
        message: data.message 
      };
    } catch (error) {
      console.error('AuthContext: API request failed:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  // Context value that will be provided to children
  const value = {
    // State
    user,
    loading,
    
    // Authentication functions
    login,
    logout,
    verifyToken,
    
    // Permission checks
    isAdmin,
    isAuthenticated,
    
    // API utilities
    getAuthHeader,
    apiRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for advanced use cases
export default AuthContext;