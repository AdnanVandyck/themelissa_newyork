import React, { useState } from 'react'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Email: ${email}, Password: ${password}`)
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
    </div>
  )
}

export default AdminLogin