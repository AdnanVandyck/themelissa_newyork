import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const navigate = useNavigate();

  // Simple email validation
  const validateEmail = (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
      setShowResendOption(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResendOption(false);
    
    // Basic validation
    if (!formData.emailOrUsername.trim()) {
      setError('Email or username is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    console.log('🚀 Attempting login for:', formData.emailOrUsername);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: formData.emailOrUsername.trim(),
          password: formData.password
        }),
      });
      
      const data = await response.json();
      console.log('✅ Login response:', data);
      
      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login successful, redirecting to dashboard');
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/staff/dashboard');
        }
      } else {
        console.log('❌ Login failed:', data.message);
        
        // Handle specific error cases
        if (data.emailNotVerified) {
          setError('Please verify your email before logging in.');
          setShowResendOption(true);
          setUserEmail(data.email);
        } else if (data.pendingApproval) {
          setError('Your account is pending approval. Please contact an administrator.');
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    try {
      console.log('📧 Resending verification email to:', userEmail);
      
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Verification email sent successfully! Please check your inbox.');
        setShowResendOption(false);
      } else {
        alert(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '400px',
      margin: '0 auto',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e1e5e9'
      }}>
        <h1 style={{ 
          marginBottom: '0.5rem',
          color: '#333',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          The Melissa NYC
        </h1>
        <p style={{ 
          marginBottom: '2rem', 
          color: '#666',
          fontSize: '1rem'
        }}>
          Property Management Portal
        </p>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {showResendOption && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #ffeaa7',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>Need to verify your email?</p>
            <button
              onClick={handleResendVerification}
              style={{
                backgroundColor: '#856404',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Resend Verification Email
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Email or Username *
            </label>
            <input
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleInputChange}
              placeholder="Enter your email or username"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                backgroundColor: loading ? '#f8f9fa' : 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  backgroundColor: loading ? '#f8f9fa' : 'white',
                  paddingRight: '3rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.2rem'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '0.9rem',
                fontWeight: 'normal',
                cursor: 'pointer',
                color: '#666'
              }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  disabled={loading}
                  style={{ marginRight: '0.5rem' }}
                />
                Show password
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading ? '#95a5a6' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {loading ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite'
                }}>⏳</span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
            Don't have an account?
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            Create Account
          </button>
        </div>

        <div style={{ marginTop: '2rem', borderTop: '1px solid #e1e5e9', paddingTop: '1rem' }}>
          <Link to="/" style={{ 
            textDecoration: 'none',
            color: '#6c757d',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ← Back to The Melissa NYC
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;