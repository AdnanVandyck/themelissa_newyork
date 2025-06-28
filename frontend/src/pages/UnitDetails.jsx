import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { unitAPI } from '../services/api'

const UnitDetails = () => {
  const { id } = useParams()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUnit()
  }, [id])

  const fetchUnit = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching unit details for ID:', id)
      
      const response = await unitAPI.getById(id)
      console.log('Unit details fetched:', response.data)
      setUnit(response.data)
    } catch (err) {
      console.error('Error fetching unit details:', err)
      if (err.response?.status === 404) {
        setError('Unit not found')
      } else {
        setError(`Failed to load unit details: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading unit details...</h2>
        <div style={{ 
          margin: '2rem auto',
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#7f8c8d' }}>Loading from database...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error Loading Unit</h1>
        <p style={{ color: '#e74c3c', marginBottom: '2rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={fetchUnit}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <Link to="/">
            <button style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Back to All Units
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!unit) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Unit Not Found</h1>
        <p>This unit doesn't exist in our database.</p>
        <Link to="/">
          <button style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Back to All Units
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}>
            ← Back to All Units
          </button>
        </Link>
      </div>
      
      {/* Unit Image */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img 
          src={unit.imageURL || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={`Unit ${unit.unitNumber}`}
          style={{
            width: '100%',
            maxWidth: '600px',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      </div>
      
      {/* Unit Info */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="unit-title">Unit {unit.unitNumber}</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <p><strong>Monthly Rent:</strong> {formatPrice(unit.price)}</p>
          <p><strong>Bedrooms:</strong> {unit.bedrooms === 0 ? 'Studio' : unit.bedrooms}</p>
          <p><strong>Bathrooms:</strong> {unit.bathrooms}</p>
          <p><strong>Added:</strong> {new Date(unit.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style={{
          padding: '1rem',
          backgroundColor: unit.available ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <strong>Status: {unit.available ? 'Available for Rent' : 'Currently Not Available'}</strong>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Description</h3>
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{unit.description}</p>
        </div>

        {/* Contact Section for Available Units */}
        {unit.available && (
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <h3>Interested in this unit?</h3>
            <p>Contact Summit Leasing Services to schedule a viewing.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => alert('Contact form coming soon!')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Schedule Viewing
              </button>
              <button
                onClick={() => alert('Application form coming soon!')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        )}
        
        {/* Admin Link (for testing) */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#e9ecef', 
          borderRadius: '5px',
          fontSize: '0.9rem',
          color: '#6c757d'
        }}>
          <strong>Live Data:</strong> This unit is loaded from your backend database.
          <br />
          <strong>Unit ID:</strong> {unit._id}
          <br />
          <Link to="/admin/dashboard" style={{ color: '#007bff' }}>
            Edit this unit in admin dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UnitDetails