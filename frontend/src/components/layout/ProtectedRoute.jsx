import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from '../../pages/AdminLogin';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', margin: 0 }}>Checking authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    console.log('ProtectedRoute: User not authenticated, showing login');
    return <AdminLogin />;
  }

  // If admin required but user is not admin
  if (requireAdmin && !isAdmin()) {
    console.log('ProtectedRoute: Admin access required but user is not admin');
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
        padding: '40px'
      }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '16px' }}>Access Denied</h2>
        <p style={{ color: '#666', marginBottom: '8px' }}>
          You need admin privileges to access this page.
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Current role: <strong>{user.role}</strong>
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  // User is authenticated and has proper permissions
  console.log('ProtectedRoute: Access granted for user:', user.username);
  return children;
};

export default ProtectedRoute;