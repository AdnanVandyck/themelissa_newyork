import React, { useState } from 'react'
import { Link } from 'react-router-dom' 

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // alert(`Email: ${email}, Password: ${password}`)
         // Simple validation - in real app this would call an API
    setTimeout(() => {
      if (email === 'admin@melissa.com' && password === 'admin123') {
        alert('Login successful! (Dashboard coming next)')
        setLoading(false)
      } else {
        setError('Invalid email or password. Try the demo credentials.')
        setLoading(false)
      }
    }, 1000) // Simulate network delay 
  }

    const fillDemoCredentials = () => {
    setEmail('admin@melissa.com')
    setPassword('admin123')
    setError('')
  }

  
  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '400px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 className="main-heading">Admin Login</h1>
      <p style={{ marginBottom: '2rem', color: '#7f8c8d' }}>
        Access the property management dashboard
      </p>

            {/* Error Message */}
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
            style={{
              width: '100%',
              padding: '0.8rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: '100%',
              padding: '0.8rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
      </form>
      {/* Demo Credentials Box */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Demo Credentials</h4>
        <p style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
          Email: admin@melissa.com<br/>
          Password: admin123
        </p>
        <button
          type="button"
          onClick={fillDemoCredentials}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Fill Demo Credentials
        </button>
      </div>

            {/* Back to Home Link */}
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