import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import AuthContext

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Use AuthContext login method

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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
    
    try {
      console.log('🚀 Attempting login via AuthContext for:', formData.emailOrUsername);
      
      // FIXED: Use AuthContext login method instead of direct fetch
      // This handles both the API call AND updating the context state
      const result = await login(formData.emailOrUsername.trim(), formData.password);
      
      console.log('📊 AuthContext login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful via AuthContext');
        console.log('👤 User role:', result.user.role);
        
        // Navigate based on role
        if (result.user.role === 'super_admin' || result.user.role === 'admin') {
          console.log('🚀 Redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else if (result.user.role === 'manager') {
          console.log('🚀 Redirecting to manager dashboard');
          navigate('/manager/dashboard');
        } else {
          console.log('🚀 Redirecting to staff dashboard');
          navigate('/staff/dashboard');
        }
      } else {
        console.log('❌ Login failed via AuthContext:', result.message);
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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
            onMouseOver={(e) => e.target.style.color = '#5a67d8'}
            onMouseOut={(e) => e.target.style.color = '#667eea'}
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