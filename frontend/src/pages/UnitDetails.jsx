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
      console.log('Fetching public unit details for ID:', id)
      
      // Use the new public endpoint
      const response = await unitAPI.getPublicById(id)
      console.log('Unit details fetched:', response.data)
      setUnit(response.data)
    } catch (err) {
      console.error('Error fetching unit details:', err)
      if (err.response?.status === 404) {
        setError('Unit not found or not available')
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
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        paddingTop: '140px' // Add top padding to account for fixed header
      }}>
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
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        paddingTop: '140px' // Add top padding to account for fixed header
      }}>
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
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        paddingTop: '140px' // Add top padding to account for fixed header
      }}>
        <h1>Unit Not Found</h1>
        <p>This unit doesn't exist or is not available for viewing.</p>
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
    <div style={{ 
      padding: '2rem',
    }}>
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
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5a6268'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6c757d'
            e.target.style.transform = 'translateY(0)'
          }}
          >
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
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '300',
          marginBottom: '2rem',
          color: '#333',
          textAlign: 'center'
        }}>
          Unit {unit.unitNumber}
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          {/* Fixed: use monthlyRent instead of price */}
          <div style={{ textAlign: 'center' }}>
            <strong style={{ fontSize: '1.1rem', color: '#333' }}>Monthly Rent</strong>
            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#000' }}>
              {formatPrice(unit.monthlyRent || unit.price)}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ fontSize: '1.1rem', color: '#333' }}>Bedrooms</strong>
            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#000' }}>
              {unit.bedrooms === 0 ? 'Studio' : unit.bedrooms}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ fontSize: '1.1rem', color: '#333' }}>Bathrooms</strong>
            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#000' }}>
              {unit.bathrooms}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ fontSize: '1.1rem', color: '#333' }}>Available Since</strong>
            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#000' }}>
              {new Date(unit.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Since this is public endpoint, unit will always be available */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center',
          border: '1px solid #c3e6cb'
        }}>
          <strong style={{ 
            fontSize: '1.2rem',
            color: '#155724'
          }}>
            ✓ Status: Available for Rent
          </strong>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '400',
            marginBottom: '1rem',
            color: '#333'
          }}>
            Description
          </h3>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <p style={{ 
              lineHeight: '1.6', 
              fontSize: '1.1rem',
              margin: '0',
              color: '#555'
            }}>
              {unit.description || 'No description available for this unit.'}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div style={{
          padding: '2rem',
          backgroundColor: '#000',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '2rem',
          color: 'white'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '300',
            marginBottom: '1rem',
            color: 'white'
          }}>
            Interested in this unit?
          </h3>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            opacity: '0.9'
          }}>
            Contact Summit Leasing Services to schedule a viewing.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <Link
              to="/contact"
              style={{
                textDecoration: 'none',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                fontWeight: '400',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Schedule Viewing
            </Link>
            <Link
              to="/contact"
              style={{
                textDecoration: 'none',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '15px 30px',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                fontWeight: '400',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white'
                e.target.style.color = 'black'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Apply Now
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default UnitDetails