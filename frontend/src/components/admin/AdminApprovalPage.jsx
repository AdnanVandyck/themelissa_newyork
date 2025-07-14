import React, { useState, useEffect } from 'react';

// Simple icon components using Unicode symbols - no external dependencies
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <style>{spinKeyframes}</style>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icons.Users />
                <div style={{ marginLeft: '0.75rem' }}>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>User Management</h1>
                  <p style={{ color: '#6b7280', margin: 0 }}>Manage user approvals and account status</p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchPendingUsers();
                  fetchAllUsers();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                <Icons.RefreshCw />
                Refresh
              </button>
            </div>
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
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', marginTop: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search */}
            <div style={{ flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <Icons.Search style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9ca3af', 
                  fontSize: '1.25rem' 
                }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Filter style={{ fontSize: '1.25rem', color: '#9ca3af' }} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="pending">Pending Approval ({pendingUsers.length})</option>
                <option value="all">All Users ({allUsers.length})</option>
                <option value="verified">Email Verified</option>
                <option value="unverified">Email Unverified</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.375rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '500' }}>
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={bulkApprove}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '0.375rem',
                    color: 'white',
                    backgroundColor: '#16a34a',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                  <Icons.Check />
                  Approve Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedUsers(new Set());
                    setShowBulkActions(false);
                  }}
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#1f2937'}
                  onMouseOut={(e) => e.target.style.color = '#6b7280'}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User List */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', marginTop: '1.5rem', paddingBottom: '3rem' }}>
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