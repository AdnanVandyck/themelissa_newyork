import React from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../../services/api'


const UnitCard = ({ unit }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getMainImage = () => {
    // First try to get the first image from the images array
    if (unit.images && unit.images.length > 0) {
      return getImageUrl(unit.images[0]) // Use helper function here
    }
    
    // Fallback to imageURL if it exists
    if (unit.imageURL) {
      return getImageUrl(unit.imageURL) // Use helper function here too
    }
    
    // Final fallback to placeholder image
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)'
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
    }}
    >
      <Link to={`/unit/${unit._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Unit Image */}
        <div style={{
          height: '250px',
          backgroundImage: `url(${getMainImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          {/* Availability Badge */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            backgroundColor: unit.available ? '#000' : '#666',
            color: 'white',
            padding: '5px 12px',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {unit.available ? 'Available' : 'Leased'}
          </div>
        </div>

        {/* Unit Details */}
        <div style={{ padding: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '15px'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '300',
              margin: '0',
              color: '#333'
            }}>
              Unit {unit.unitNumber}
            </h3>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#000'
            }}>
              {formatPrice(unit.price)}
              <span style={{
                fontSize: '0.9rem',
                fontWeight: '300',
                color: '#666'
              }}>
                /month
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <span>{unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bed`}</span>
            <span>{unit.bathrooms} Bath</span>
          </div>

          {unit.description && (
            <p style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#666',
              margin: '0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {unit.description}
            </p>
          )}

          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            fontSize: '12px',
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            View Details →
          </div>
        </div>
      </Link>
    </div>
  )
}

export default UnitCard