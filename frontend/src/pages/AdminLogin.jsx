import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validateEmail, validatePassword } from '../utils/helpers' // Import helpers

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Get login function from our auth context
  const { login } = useAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Client-side validation using helpers
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      return
    }
    
    setLoading(true)
    console.log('AdminLogin: Attempting login for:', email)
    
    // Use real authentication
    const result = await login(email, password)
    
    if (result.success) {
      console.log('AdminLogin: Login successful, redirecting to dashboard')
      window.location.href = '/admin/dashboard'
    } else {
      console.log('AdminLogin: Login failed:', result.message)
      setError(result.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('admin@test.com')
    setPassword('password123')
    setError('')
  }

  // Rest of your component stays exactly the same...
  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '400px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {/* Your existing JSX stays the same */}
      <h1 className="main-heading">Admin Login</h1>
      <p style={{ marginBottom: '2rem', color: '#7f8c8d' }}>
        Access the property management dashboard
      </p>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem',
              backgroundColor: loading ? '#f8f9fa' : 'white'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem',
              backgroundColor: loading ? '#f8f9fa' : 'white'
            }}
          />

          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.9rem',
              fontWeight: 'normal',
              cursor: 'pointer'
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
            backgroundColor: loading ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Demo Credentials</h4>
        <p style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
          Email: admin@test.com<br/>
          Password: password123
        </p>
        <button
          type="button"
          onClick={fillDemoCredentials}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#95a5a6' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          Fill Demo Credentials
        </button>
      </div> */}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ 
          textDecoration: 'none',
          color: '#6c757d',
          fontSize: '0.9rem'
        }}>
          ← Back to The Melissa NYC
        </Link>
      </div>
    </div>
  )
}

export default AdminLogin