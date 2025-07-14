// import React, { useState, useEffect } from 'react';
// import { Users, Check, X, Mail, Clock, AlertCircle, Shield, Search, Filter, RefreshCw, Home, Settings, LogOut } from 'lucide-react';

// // Optional: Admin Navigation Component
// const AdminNav = ({ currentUser, onLogout }) => {
//   return (
//     <nav className="bg-white shadow-sm border-b mb-6">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-4">
//           <div className="flex items-center space-x-8">
//             <div className="flex items-center">
//               <span className="text-xl font-bold text-gray-900">The Melissa NYC</span>
//               <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Admin</span>
//             </div>
//             <div className="hidden md:flex space-x-6">
//               <a href="/admin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
//                 <Home className="w-4 h-4 mr-1" />
//                 Dashboard
//               </a>
//               <a href="/admin/users" className="flex items-center text-blue-600 font-medium">
//                 <Users className="w-4 h-4 mr-1" />
//                 User Management
//               </a>
//               <a href="/admin/properties" className="flex items-center text-gray-600 hover:text-gray-900">
//                 <Settings className="w-4 h-4 mr-1" />
//                 Properties
//               </a>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">
//               Welcome, {currentUser?.firstName || 'Admin'}
//             </span>
//             <button
//               onClick={onLogout}
//               className="flex items-center text-gray-600 hover:text-gray-900"
//             >
//               <LogOut className="w-4 h-4 mr-1" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// // Utility function to get API base URL (from your existing smart detection)
// const getApiBaseUrl = () => {
//   const hostname = window.location.hostname;
//   if (hostname === 'localhost') return 'http://localhost:5000';
//   if (hostname.includes('192.168.')) return `http://${hostname}:5000`;
//   return 'https://themelissa-backend.onrender.com';
// };

// const AdminApprovalPage = () => {
//   const [pendingUsers, setPendingUsers] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState({});
//   const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'verified', 'unverified'
//   const [searchTerm, setSearchTerm] = useState('');
//   const [notification, setNotification] = useState(null);

//   // Get JWT token from localStorage
//   const getAuthToken = () => localStorage.getItem('token');

//   // API request helper with authentication
//   const apiRequest = async (endpoint, options = {}) => {
//     const token = getAuthToken();
//     const baseUrl = getApiBaseUrl();
    
//     const config = {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         ...options.headers
//       },
//       ...options
//     };

//     const response = await fetch(`${baseUrl}${endpoint}`, config);
    
//     if (!response.ok) {
//       const error = await response.text();
//       throw new Error(error || `HTTP error! status: ${response.status}`);
//     }
    
//     return response.json();
//   };

//   // Show notification
//   const showNotification = (message, type = 'success') => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 5000);
//   };

//   // Fetch pending users
//   const fetchPendingUsers = async () => {
//     try {
//       const data = await apiRequest('/api/auth/pending-users');
//       setPendingUsers(data);
//     } catch (error) {
//       console.error('Error fetching pending users:', error);
//       showNotification('Failed to fetch pending users', 'error');
//     }
//   };

//   // Fetch all users
//   const fetchAllUsers = async () => {
//     try {
//       const data = await apiRequest('/api/auth/users');
//       setAllUsers(data);
//     } catch (error) {
//       console.error('Error fetching all users:', error);
//       showNotification('Failed to fetch users', 'error');
//     }
//   };

//   // Initial data load
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   // Approve user
//   const approveUser = async (userId) => {
//     setProcessing(prev => ({ ...prev, [userId]: 'approving' }));
//     try {
//       await apiRequest(`/api/auth/approve-user/${userId}`, { method: 'PUT' });
      
//       // Update local state
//       setPendingUsers(prev => prev.filter(user => user._id !== userId));
//       setAllUsers(prev => prev.map(user => 
//         user._id === userId ? { ...user, isActive: true } : user
//       ));
      
//       showNotification('User approved successfully!');
//     } catch (error) {
//       console.error('Error approving user:', error);
//       showNotification('Failed to approve user', 'error');
//     } finally {
//       setProcessing(prev => ({ ...prev, [userId]: null }));
//     }
//   };

//   // Reject user
//   const rejectUser = async (userId) => {
//     setProcessing(prev => ({ ...prev, [userId]: 'rejecting' }));
//     try {
//       await apiRequest(`/api/auth/reject-user/${userId}`, { method: 'PUT' });
      
//       // Update local state
//       setPendingUsers(prev => prev.filter(user => user._id !== userId));
//       setAllUsers(prev => prev.filter(user => user._id !== userId));
      
//       showNotification('User rejected and removed');
//     } catch (error) {
//       console.error('Error rejecting user:', error);
//       showNotification('Failed to reject user', 'error');
//     } finally {
//       setProcessing(prev => ({ ...prev, [userId]: null }));
//     }
//   };

//   // Filter and search users
//   const getFilteredUsers = () => {
//     let users = [];
    
//     switch (filter) {
//       case 'pending':
//         users = pendingUsers;
//         break;
//       case 'verified':
//         users = allUsers.filter(user => user.emailVerified);
//         break;
//       case 'unverified':
//         users = allUsers.filter(user => !user.emailVerified);
//         break;
//       default:
//         users = allUsers;
//     }

//     if (searchTerm) {
//       users = users.filter(user => 
//         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.username?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     return users;
//   };

//   const filteredUsers = getFilteredUsers();

//   // User status component
//   const UserStatus = ({ user }) => {
//     if (!user.emailVerified) {
//       return (
//         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//           <Mail className="w-3 h-3 mr-1" />
//           Email Unverified
//         </span>
//       );
//     }
    
//     if (!user.isActive) {
//       return (
//         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//           <Clock className="w-3 h-3 mr-1" />
//           Pending Approval
//         </span>
//       );
//     }
    
//     return (
//       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//         <Check className="w-3 h-3 mr-1" />
//         Active
//       </span>
//     );
//   };

//   // Role badge component
//   const RoleBadge = ({ role }) => {
//     const colors = {
//       staff: 'bg-blue-100 text-blue-800',
//       manager: 'bg-purple-100 text-purple-800',
//       admin: 'bg-red-100 text-red-800',
//       super_admin: 'bg-gray-100 text-gray-800'
//     };
    
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
//         <Shield className="w-3 h-3 mr-1" />
//         {role?.replace('_', ' ').toUpperCase()}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
//           <p className="text-gray-600">Loading user data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Optional: Add navigation if you want it integrated */}
//       {/* <AdminNav currentUser={currentUser} onLogout={handleLogout} /> */}
      
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <Users className="w-8 h-8 text-blue-600 mr-3" />
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
//                   <p className="text-gray-600">Manage user approvals and account status</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   fetchPendingUsers();
//                   fetchAllUsers();
//                 }}
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Notification */}
//       {notification && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
//           <div className={`rounded-md p-4 ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 {notification.type === 'success' ? (
//                   <Check className="h-5 w-5 text-green-400" />
//                 ) : (
//                   <AlertCircle className="h-5 w-5 text-red-400" />
//                 )}
//               </div>
//               <div className="ml-3">
//                 <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
//                   {notification.message}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Controls */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             {/* Search */}
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search users..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             {/* Filter */}
//             <div className="flex items-center gap-2">
//               <Filter className="w-5 h-5 text-gray-400" />
//               <select
//                 value={filter}
//                 onChange={(e) => setFilter(e.target.value)}
//                 className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="pending">Pending Approval ({pendingUsers.length})</option>
//                 <option value="all">All Users ({allUsers.length})</option>
//                 <option value="verified">Email Verified</option>
//                 <option value="unverified">Email Unverified</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* User List */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
//         <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//           {filteredUsers.length === 0 ? (
//             <div className="text-center py-12">
//               <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
//               <p className="text-gray-500">
//                 {filter === 'pending' ? 'No users are currently pending approval.' : 'No users match your search criteria.'}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       User
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Role
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Registration Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredUsers.map((user) => (
//                     <tr key={user._id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {user.firstName} {user.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">{user.email}</div>
//                           <div className="text-xs text-gray-400">@{user.username}</div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <RoleBadge role={user.role} />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <UserStatus user={user} />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {new Date(user.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         {user.emailVerified && !user.isActive && (
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => approveUser(user._id)}
//                               disabled={processing[user._id]}
//                               className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                               {processing[user._id] === 'approving' ? (
//                                 <RefreshCw className="w-4 h-4 animate-spin mr-1" />
//                               ) : (
//                                 <Check className="w-4 h-4 mr-1" />
//                               )}
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => rejectUser(user._id)}
//                               disabled={processing[user._id]}
//                               className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                               {processing[user._id] === 'rejecting' ? (
//                                 <RefreshCw className="w-4 h-4 animate-spin mr-1" />
//                               ) : (
//                                 <X className="w-4 h-4 mr-1" />
//                               )}
//                               Reject
//                             </button>
//                           </div>
//                         )}
//                         {!user.emailVerified && (
//                           <span className="text-gray-400 text-sm">Email verification required</span>
//                         )}
//                         {user.isActive && (
//                           <span className="text-green-600 text-sm">Active user</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminApprovalPage;

import React, { useState, useEffect } from 'react';

// Simple icon components using Unicode symbols
const Icons = {
  Users: () => <span style={{ fontSize: '1.2em' }}>👥</span>,
  Check: () => <span style={{ fontSize: '1em', color: 'currentColor' }}>✓</span>,
  X: () => <span style={{ fontSize: '1em', color: 'currentColor' }}>✕</span>,
  Mail: () => <span style={{ fontSize: '1em' }}>📧</span>,
  Clock: () => <span style={{ fontSize: '1em' }}>⏰</span>,
  AlertCircle: () => <span style={{ fontSize: '1em', color: 'currentColor' }}>⚠</span>,
  Shield: () => <span style={{ fontSize: '0.8em' }}>🛡</span>,
  Search: () => <span style={{ fontSize: '1em' }}>🔍</span>,
  Filter: () => <span style={{ fontSize: '1em' }}>🔽</span>,
  RefreshCw: ({ className = '' }) => (
    <span 
      style={{ 
        fontSize: '1em', 
        display: 'inline-block',
        animation: className.includes('animate-spin') ? 'spin 1s linear infinite' : 'none'
      }}
    >
      🔄
    </span>
  ),
  Home: () => <span style={{ fontSize: '1em' }}>🏠</span>,
  Settings: () => <span style={{ fontSize: '1em' }}>⚙️</span>,
  LogOut: () => <span style={{ fontSize: '1em' }}>🚪</span>
};

// Add spin animation
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Optional: Admin Navigation Component
const AdminNav = ({ currentUser, onLogout }) => {
  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '1.5rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>The Melissa NYC</span>
              <span style={{ 
                marginLeft: '0.5rem', 
                padding: '0.25rem 0.5rem', 
                backgroundColor: '#dbeafe', 
                color: '#1e40af', 
                fontSize: '0.75rem', 
                borderRadius: '9999px' 
              }}>
                Admin
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/admin/dashboard" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#6b7280', 
                textDecoration: 'none',
                gap: '0.25rem'
              }}>
                <Icons.Home />
                Dashboard
              </a>
              <a href="/admin/users" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#2563eb', 
                fontWeight: '500',
                textDecoration: 'none',
                gap: '0.25rem'
              }}>
                <Icons.Users />
                User Management
              </a>
              <a href="/admin/properties" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#6b7280', 
                textDecoration: 'none',
                gap: '0.25rem'
              }}>
                <Icons.Settings />
                Properties
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Welcome, {currentUser?.firstName || 'Admin'}
            </span>
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                gap: '0.25rem'
              }}
            >
              <Icons.LogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Utility function to get API base URL (from your existing smart detection)
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost:5000';
  if (hostname.includes('192.168.')) return `http://${hostname}:5000`;
  return 'https://themelissa-backend.onrender.com';
};

const AdminApprovalPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'verified', 'unverified'
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, user: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // API request helper with authentication
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const baseUrl = getApiBaseUrl();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      // Handle specific error codes from your backend
      if (response.status === 403) {
        throw new Error(errorData.message || 'Insufficient permissions');
      }
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      throw new Error(errorData.message || `Request failed with status: ${response.status}`);
    }
    
    return response.json();
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const response = await apiRequest('/api/auth/pending-users');
      // Your backend returns { success, count, users }
      setPendingUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      showNotification(error.message || 'Failed to fetch pending users', 'error');
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await apiRequest('/api/auth/users');
      // Your backend returns { success, count, users }
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      showNotification(error.message || 'Failed to fetch users', 'error');
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Approve user
  const approveUser = async (userId) => {
    setProcessing(prev => ({ ...prev, [userId]: 'approving' }));
    try {
      const response = await apiRequest(`/api/auth/approve-user/${userId}`, { method: 'PUT' });
      
      if (response.success) {
        // Update local state
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setAllUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isActive: true } : user
        ));
        
        showNotification('User approved successfully! Approval email has been sent.');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      
      // Handle specific error cases from your backend
      if (error.message.includes('EMAIL_NOT_VERIFIED')) {
        showNotification('Cannot approve user with unverified email address', 'error');
      } else {
        showNotification(error.message || 'Failed to approve user', 'error');
      }
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: null }));
    }
  };

  // Reject user
  const rejectUser = async (userId, reason = '') => {
    setProcessing(prev => ({ ...prev, [userId]: 'rejecting' }));
    try {
      const response = await apiRequest(`/api/auth/reject-user/${userId}`, { 
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
      
      if (response.success) {
        // Update local state - user is completely removed per your backend implementation
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setAllUsers(prev => prev.filter(user => user._id !== userId));
        
        showNotification('User rejected and removed. Rejection email has been sent.');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      showNotification(error.message || 'Failed to reject user', 'error');
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: null }));
    }
  };

  // Handle rejection with reason
  const handleRejectWithReason = async () => {
    if (!rejectionModal.user) return;
    
    await rejectUser(rejectionModal.user._id, rejectionReason);
    setRejectionModal({ open: false, user: null });
    setRejectionReason('');
  };

  // Open rejection modal
  const openRejectionModal = (user) => {
    setRejectionModal({ open: true, user });
    setRejectionReason('');
  };

  // Bulk actions
  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllUsers = () => {
    const eligibleUsers = filteredUsers.filter(user => user.emailVerified && !user.isActive);
    if (selectedUsers.size === eligibleUsers.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedUsers(new Set(eligibleUsers.map(user => user._id)));
      setShowBulkActions(true);
    }
  };

  const bulkApprove = async () => {
    const userIds = Array.from(selectedUsers);
    setProcessing(prev => {
      const updated = { ...prev };
      userIds.forEach(id => updated[id] = 'approving');
      return updated;
    });

    const results = await Promise.allSettled(
      userIds.map(userId => apiRequest(`/api/auth/approve-user/${userId}`, { method: 'PUT' }))
    );

    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        const userId = userIds[index];
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setAllUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isActive: true } : user
        ));
      }
    });

    setSelectedUsers(new Set());
    setShowBulkActions(false);
    setProcessing({});
    showNotification(`${successCount} users approved successfully!`);
  };

  // Filter and search users
  const getFilteredUsers = () => {
    let users = [];
    
    switch (filter) {
      case 'pending':
        users = pendingUsers;
        break;
      case 'verified':
        users = allUsers.filter(user => user.emailVerified);
        break;
      case 'unverified':
        users = allUsers.filter(user => !user.emailVerified);
        break;
      default:
        users = allUsers;
    }

    if (searchTerm) {
      users = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return users;
  };

  const filteredUsers = getFilteredUsers();

  // User status component
  const UserStatus = ({ user }) => {
    if (!user.emailVerified) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          backgroundColor: '#fef3c7',
          color: '#92400e'
        }}>
          <Icons.Mail />
          Email Unverified
        </span>
      );
    }
    
    if (!user.isActive) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          backgroundColor: '#fed7aa',
          color: '#9a3412'
        }}>
          <Icons.Clock />
          Pending Approval
        </span>
      );
    }
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: '#dcfce7',
        color: '#166534'
      }}>
        <Icons.Check />
        Active
      </span>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    const colors = {
      staff: { bg: '#dbeafe', color: '#1e40af' },
      manager: { bg: '#f3e8ff', color: '#7c3aed' },
      admin: { bg: '#fecaca', color: '#dc2626' },
      super_admin: { bg: '#f3f4f6', color: '#374151' }
    };
    
    const colorScheme = colors[role] || colors.staff;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: colorScheme.bg,
        color: colorScheme.color
      }}>
        <Icons.Shield />
        {role?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Icons.RefreshCw className="animate-spin" style={{ fontSize: '2rem', margin: '0 auto 1rem', color: '#2563eb' }} />
          <p style={{ color: '#6b7280' }}>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional: Add navigation if you want it integrated */}
      {/* <AdminNav currentUser={currentUser} onLogout={handleLogout} /> */}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600">Manage user approvals and account status</p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchPendingUsers();
                  fetchAllUsers();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={bulkApprove}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedUsers(new Set());
                    setShowBulkActions(false);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', marginTop: '1rem' }}>
          <div style={{
            borderRadius: '0.375rem',
            padding: '1rem',
            backgroundColor: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flexShrink: 0 }}>
                {notification.type === 'success' ? (
                  <Icons.Check style={{ fontSize: '1.25rem', color: '#22c55e' }} />
                ) : (
                  <Icons.AlertCircle style={{ fontSize: '1.25rem', color: '#ef4444' }} />
                )}
              </div>
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: notification.type === 'success' ? '#15803d' : '#dc2626',
                  margin: 0
                }}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <Icons.Clock style={{ fontSize: '2rem', color: '#fb923c' }} />
              </div>
              <div style={{ marginLeft: '1.25rem', width: '0', flexGrow: 1 }}>
                <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>Pending Approval</dt>
                <dd style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>{pendingUsers.length}</dd>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <Icons.Check style={{ fontSize: '2rem', color: '#34d399' }} />
              </div>
              <div style={{ marginLeft: '1.25rem', width: '0', flexGrow: 1 }}>
                <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>Active Users</dt>
                <dd style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                  {allUsers.filter(user => user.isActive).length}
                </dd>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <Icons.Mail style={{ fontSize: '2rem', color: '#60a5fa' }} />
              </div>
              <div style={{ marginLeft: '1.25rem', width: '0', flexGrow: 1 }}>
                <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>Email Verified</dt>
                <dd style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                  {allUsers.filter(user => user.emailVerified).length}
                </dd>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <Icons.Users style={{ fontSize: '2rem', color: '#a78bfa' }} />
              </div>
              <div style={{ marginLeft: '1.25rem', width: '0', flexGrow: 1 }}>
                <dt style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>Total Users</dt>
                <dd style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>{allUsers.length}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending Approval ({pendingUsers.length})</option>
                <option value="all">All Users ({allUsers.length})</option>
                <option value="verified">Email Verified</option>
                <option value="unverified">Email Unverified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Icons.Users style={{ fontSize: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>No users found</h3>
              <p style={{ color: '#6b7280' }}>
                {filter === 'pending' ? 'No users are currently pending approval.' : 'No users match your search criteria.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {filter === 'pending' && (
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.filter(user => user.emailVerified && !user.isActive).length}
                          onChange={selectAllUsers}
                          style={{ height: '1rem', width: '1rem', color: '#2563eb', borderColor: '#d1d5db', borderRadius: '0.25rem' }}
                        />
                      </th>
                    )}
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      User Details
                    </th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Role & Permissions
                    </th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status & Verification
                    </th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Registration Info
                    </th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {filter === 'pending' && (
                        <td style={{ padding: '1.5rem 1rem' }}>
                          {user.emailVerified && !user.isActive ? (
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user._id)}
                              onChange={() => toggleUserSelection(user._id)}
                              style={{ height: '1rem', width: '1rem', color: '#2563eb', borderColor: '#d1d5db', borderRadius: '0.25rem' }}
                            />
                          ) : null}
                        </td>
                      )}
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>@{user.username}</div>
                          {user.registrationIP && (
                            <div style={{ fontSize: '0.75rem', color: '#d1d5db' }}>IP: {user.registrationIP}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <RoleBadge role={user.role} />
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {user.permissions?.users?.create && '👑 User Admin '}
                            {user.permissions?.units?.update && '🏠 Property Mgmt '}
                            {user.permissions?.gallery?.update && '📸 Gallery Mgmt'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <UserStatus user={user} />
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {user.emailVerified ? (
                              <div style={{ color: '#16a34a' }}>✓ Email verified</div>
                            ) : (
                              <div style={{ color: '#eab308' }}>⚠ Email unverified</div>
                            )}
                            {user.verificationAttempts > 0 && (
                              <div>Verification attempts: {user.verificationAttempts}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#111827' }}>
                          {formatDate(user.createdAt)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {user.registeredBy === 'self-registration' ? (
                            'Self-registered'
                          ) : (
                            'Created by admin'
                          )}
                        </div>
                        {user.lastLogin && (
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            Last login: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        {user.emailVerified && !user.isActive && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => approveUser(user._id)}
                              disabled={processing[user._id]}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.75rem',
                                border: 'none',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: '500',
                                borderRadius: '0.375rem',
                                color: 'white',
                                backgroundColor: processing[user._id] ? '#9ca3af' : '#16a34a',
                                cursor: processing[user._id] ? 'not-allowed' : 'pointer',
                                opacity: processing[user._id] ? 0.5 : 1
                              }}
                              onMouseOver={(e) => {
                                if (!processing[user._id]) {
                                  e.target.style.backgroundColor = '#15803d';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!processing[user._id]) {
                                  e.target.style.backgroundColor = '#16a34a';
                                }
                              }}
                            >
                              {processing[user._id] === 'approving' ? (
                                <Icons.RefreshCw className="animate-spin" />
                              ) : (
                                <Icons.Check />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectionModal(user)}
                              disabled={processing[user._id]}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.75rem',
                                border: 'none',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: '500',
                                borderRadius: '0.375rem',
                                color: 'white',
                                backgroundColor: processing[user._id] ? '#9ca3af' : '#dc2626',
                                cursor: processing[user._id] ? 'not-allowed' : 'pointer',
                                opacity: processing[user._id] ? 0.5 : 1
                              }}
                              onMouseOver={(e) => {
                                if (!processing[user._id]) {
                                  e.target.style.backgroundColor = '#b91c1c';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!processing[user._id]) {
                                  e.target.style.backgroundColor = '#dc2626';
                                }
                              }}
                            >
                              {processing[user._id] === 'rejecting' ? (
                                <Icons.RefreshCw className="animate-spin" />
                              ) : (
                                <Icons.X />
                              )}
                              Reject
                            </button>
                          </div>
                        )}
                        {!user.emailVerified && (
                          <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            <div>Email verification required</div>
                            {user.emailVerificationExpires && (
                              <div style={{ fontSize: '0.75rem' }}>
                                Token expires: {formatDate(user.emailVerificationExpires)}
                              </div>
                            )}
                          </div>
                        )}
                        {user.isActive && (
                          <span style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: '500' }}>✓ Active user</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal.open && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(107, 114, 128, 0.5)',
            overflowY: 'auto',
            height: '100%',
            width: '100%',
            zIndex: 50
          }}
          onClick={() => setRejectionModal({ open: false, user: null })}
        >
          <div 
            style={{
              position: 'relative',
              top: '5rem',
              margin: '0 auto',
              padding: '1.25rem',
              border: '1px solid #e5e7eb',
              width: '24rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.375rem',
              backgroundColor: 'white'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Reject User Application</h3>
                <button
                  onClick={() => setRejectionModal({ open: false, user: null })}
                  style={{
                    color: '#9ca3af',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#6b7280'}
                  onMouseOut={(e) => e.target.style.color = '#9ca3af'}
                >
                  <Icons.X />
                </button>
              </div>
              
              {rejectionModal.user && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    {rejectionModal.user.firstName} {rejectionModal.user.lastName}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rejectionModal.user.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Role: {rejectionModal.user.role}</div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="rejectionReason" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Reason for rejection (optional)
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#dc2626';
                    e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Provide a reason for rejection that will be included in the email to the user..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setRejectionModal({ open: false, user: null })}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithReason}
                  disabled={processing[rejectionModal.user?._id]}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '0.375rem',
                    color: 'white',
                    backgroundColor: processing[rejectionModal.user?._id] ? '#9ca3af' : '#dc2626',
                    cursor: processing[rejectionModal.user?._id] ? 'not-allowed' : 'pointer',
                    opacity: processing[rejectionModal.user?._id] ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!processing[rejectionModal.user?._id]) {
                      e.target.style.backgroundColor = '#b91c1c';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!processing[rejectionModal.user?._id]) {
                      e.target.style.backgroundColor = '#dc2626';
                    }
                  }}
                >
                  {processing[rejectionModal.user?._id] ? (
                    <Icons.RefreshCw className="animate-spin" />
                  ) : (
                    <Icons.X />
                  )}
                  Reject User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPage;