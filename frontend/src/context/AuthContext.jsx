// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Create the authentication context
// const AuthContext = createContext();

// // Custom hook to use the auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // AuthProvider component that wraps your app
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // API base URL - adjust if your backend runs on different port
//   const API_BASE_URL = 'http://localhost:5000/api';

//   // Check for existing token when app loads
//   useEffect(() => {
//     console.log('AuthContext: Initializing authentication...');
//     const token = localStorage.getItem('token');
    
//     if (token) {
//       console.log('AuthContext: Found existing token, verifying...');
//       verifyToken(token);
//     } else {
//       console.log('AuthContext: No existing token found');
//       setLoading(false);
//     }
//   }, []);

//   // Verify if stored token is still valid
//   const verifyToken = async (token) => {
//     try {
//       console.log('AuthContext: Verifying token with backend...');
      
//       const response = await fetch(`${API_BASE_URL}/auth/verify`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('AuthContext: Token valid, user authenticated:', data.user.username);
//         setUser(data.user);
//       } else {
//         console.log('AuthContext: Token invalid, removing from storage');
//         localStorage.removeItem('token');
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('AuthContext: Token verification failed:', error);
//       localStorage.removeItem('token');
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Login function
//   const login = async (email, password) => {
//     try {
//       console.log('AuthContext: Attempting login for email:', email);
      
//       const response = await fetch(`${API_BASE_URL}/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         console.log('AuthContext: Login successful for user:', data.user.username);
//         console.log('AuthContext: User role:', data.user.role);
        
//         // Store token in localStorage
//         localStorage.setItem('token', data.token);
        
//         // Update user state
//         setUser(data.user);
        
//         return { success: true, user: data.user };
//       } else {
//         console.log('AuthContext: Login failed:', data.message);
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       console.error('AuthContext: Login error:', error);
//       return { 
//         success: false, 
//         message: 'Network error. Please check your internet connection.' 
//       };
//     }
//   };

//   // Logout function
//   const logout = () => {
//     console.log('AuthContext: Logging out user:', user?.username);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user'); // Also clear stored user data
//     setUser(null);
    
//     // Optional: Redirect to home page after logout
//     window.location.href = '/';
//   };

//   // FIXED: Check if current user is admin or super_admin
//   const isAdmin = () => {
//     const result = user?.role === 'admin' || user?.role === 'super_admin';
//     console.log('AuthContext: isAdmin check:', result, 'for user:', user?.username, 'role:', user?.role);
//     return result;
//   };

//   // Check if user is authenticated
//   const isAuthenticated = () => {
//     const result = !!user;
//     console.log('AuthContext: isAuthenticated check:', result);
//     return result;
//   };

//   // NEW: Check if user is super admin specifically
//   const isSuperAdmin = () => {
//     const result = user?.role === 'super_admin';
//     console.log('AuthContext: isSuperAdmin check:', result, 'for user:', user?.username);
//     return result;
//   };

//   // NEW: Check if user is manager or higher
//   const isManager = () => {
//     const result = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'super_admin';
//     console.log('AuthContext: isManager check:', result, 'for user:', user?.username, 'role:', user?.role);
//     return result;
//   };

//   // NEW: Flexible role checking with hierarchy
//   const hasRole = (requiredRole) => {
//     // Define role hierarchy - higher roles include lower role permissions
//     const roleHierarchy = {
//       'staff': ['staff'],
//       'manager': ['staff', 'manager'],
//       'admin': ['staff', 'manager', 'admin'],
//       'super_admin': ['staff', 'manager', 'admin', 'super_admin']
//     };
    
//     const userRoles = roleHierarchy[user?.role] || [];
//     const result = userRoles.includes(requiredRole);
//     console.log('AuthContext: hasRole check:', result, 'for role:', requiredRole, 'user role:', user?.role);
//     return result;
//   };

//   // NEW: Check specific permissions
//   const hasPermission = (resource, action) => {
//     if (!user?.permissions) return false;
    
//     const resourcePermissions = user.permissions[resource];
//     if (!resourcePermissions) return false;
    
//     const result = resourcePermissions[action] === true;
//     console.log('AuthContext: hasPermission check:', result, 'for', `${resource}.${action}`, 'user:', user?.username);
//     return result;
//   };

//   // Get authorization header for API requests
//   const getAuthHeader = () => {
//     const token = localStorage.getItem('token');
//     return token ? { 'Authorization': `Bearer ${token}` } : {};
//   };

//   // Make authenticated API requests
//   const apiRequest = async (endpoint, options = {}) => {
//     const token = localStorage.getItem('token');
    
//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { 'Authorization': `Bearer ${token}` }),
//         ...options.headers
//       },
//       ...options
//     };

//     try {
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
//       // If token expired, logout user
//       if (response.status === 401) {
//         console.log('AuthContext: Token expired, logging out user');
//         logout();
//         return { success: false, message: 'Session expired. Please login again.' };
//       }

//       const data = await response.json();
//       return { 
//         success: response.ok, 
//         data, 
//         status: response.status,
//         message: data.message 
//       };
//     } catch (error) {
//       console.error('AuthContext: API request failed:', error);
//       return { 
//         success: false, 
//         message: 'Network error. Please try again.' 
//       };
//     }
//   };

//   // Context value that will be provided to children
//   const value = {
//     // State
//     user,
//     loading,
    
//     // Authentication functions
//     login,
//     logout,
//     verifyToken,
    
//     // Permission checks
//     isAdmin,           // FIXED: Now includes super_admin
//     isAuthenticated,
//     isSuperAdmin,      // NEW: Check for super_admin specifically
//     isManager,         // NEW: Check for manager or higher
//     hasRole,           // NEW: Hierarchical role checking
//     hasPermission,     // NEW: Granular permission checking
    
//     // API utilities
//     getAuthHeader,
//     apiRequest
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Export the context for advanced use cases
// export default AuthContext;

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

// FIXED: Correct API base URL detection for production
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  console.log('🌍 AuthContext - Current hostname:', hostname);
  console.log('🌍 AuthContext - Full URL:', window.location.href);
  
  // FIXED: More specific localhost detection
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🔧 AuthContext - Using development API (localhost detected)');
    return 'http://localhost:5000';
  }
  
  // Local network (for mobile testing)
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.0.') || hostname.startsWith('172.')) {
    console.log('📱 AuthContext - Using local network API');
    return `http://${hostname}:5000`;
  }
  
  // FIXED: Everything else is production (including themelissanyc.com)
  console.log('🚀 AuthContext - Using production API (non-localhost detected)');
  return 'https://themelissa-backend.onrender.com';
};

// AuthProvider component that wraps your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL - uses corrected detection
  const API_BASE_URL = `${getApiBaseUrl()}/api`;

  // Log the API URL being used
  useEffect(() => {
    console.log('🔗 AuthContext - API Base URL configured as:', API_BASE_URL);
  }, [API_BASE_URL]);

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
      console.log('🎯 AuthContext: Verify URL:', `${API_BASE_URL}/auth/verify`);
      
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

  // FIXED: Enhanced login function with detailed logging
  const login = async (emailOrUsername, password) => {
    try {
      console.log('🔑 AuthContext: Login starting...');
      console.log('📧 AuthContext: Email/Username:', emailOrUsername);
      console.log('🔗 AuthContext: API Base URL:', API_BASE_URL);
      
      const loginUrl = `${API_BASE_URL}/auth/login`;
      console.log('🎯 AuthContext: Full login URL:', loginUrl);
      
      const requestBody = { 
        // FIXED: Match your backend's expected field name
        emailOrUsername: emailOrUsername,
        password: password 
      };
      console.log('📦 AuthContext: Request body:', requestBody);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📊 AuthContext: Response status:', response.status);
      console.log('📊 AuthContext: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📊 AuthContext: Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ AuthContext: Login successful for user:', data.user.username);
        console.log('👤 AuthContext: User role:', data.user.role);
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update user state
        setUser(data.user);
        
        return { success: true, user: data.user };
      } else {
        console.log('❌ AuthContext: Login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('💥 AuthContext: Login error:', error);
      console.error('💥 AuthContext: Error name:', error.name);
      console.error('💥 AuthContext: Error message:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please check if the backend is running.' 
        };
      }
      
      return { 
        success: false, 
        message: `Connection error: ${error.message}` 
      };
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext: Logging out user:', user?.username);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Redirect to home page after logout
    window.location.href = '/';
  };

  // Check if current user is admin or super_admin
  const isAdmin = () => {
    const result = user?.role === 'admin' || user?.role === 'super_admin';
    console.log('AuthContext: isAdmin check:', result, 'for user:', user?.username, 'role:', user?.role);
    return result;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const result = !!user;
    console.log('AuthContext: isAuthenticated check:', result);
    return result;
  };

  // Check if user is super admin specifically
  const isSuperAdmin = () => {
    const result = user?.role === 'super_admin';
    console.log('AuthContext: isSuperAdmin check:', result, 'for user:', user?.username);
    return result;
  };

  // Check if user is manager or higher
  const isManager = () => {
    const result = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'super_admin';
    console.log('AuthContext: isManager check:', result, 'for user:', user?.username, 'role:', user?.role);
    return result;
  };

  // Flexible role checking with hierarchy
  const hasRole = (requiredRole) => {
    const roleHierarchy = {
      'staff': ['staff'],
      'manager': ['staff', 'manager'],
      'admin': ['staff', 'manager', 'admin'],
      'super_admin': ['staff', 'manager', 'admin', 'super_admin']
    };
    
    const userRoles = roleHierarchy[user?.role] || [];
    const result = userRoles.includes(requiredRole);
    console.log('AuthContext: hasRole check:', result, 'for role:', requiredRole, 'user role:', user?.role);
    return result;
  };

  // Check specific permissions
  const hasPermission = (resource, action) => {
    if (!user?.permissions) return false;
    
    const resourcePermissions = user.permissions[resource];
    if (!resourcePermissions) return false;
    
    const result = resourcePermissions[action] === true;
    console.log('AuthContext: hasPermission check:', result, 'for', `${resource}.${action}`, 'user:', user?.username);
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

  // Context value
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
    isSuperAdmin,
    isManager,
    hasRole,
    hasPermission,
    
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

export default AuthContext;