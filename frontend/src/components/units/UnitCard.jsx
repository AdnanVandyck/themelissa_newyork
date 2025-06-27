import React from 'react'
import { Link } from 'react-router-dom'

const UnitCard = ({ unit }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div style={{
      border: '2px solid #e8e8e8',
      borderRadius: '12px',
      marginBottom: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
        <div style={{ position: 'relative'}}>
            <img 
            src={unit.imageURL || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
            alt={`Unit ${unit.unitNumber}`}
            style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover'
            }}
            />
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: '#3498db',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: 'bold'
            }}>
                {formatPrice(unit.price)}/mo
            </div>
            
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: unit.available === false ? '#e74c3c' : '#27ae60',
                color: 'white',
                padding: '0.3rem 0.8rem',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
            }}>
                {unit.available === false ? 'Not Available' : 'Available'}
            </div>
        </div>

      <div style={{ padding: '1.5rem'}}>
        <h4 className="unit-title">Unit {unit.unitNumber}</h4>
        <p className="regular-text">{unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bedrooms`}</p>
        <p className="regular-text">{unit.bathrooms} Bathroom{unit.bathrooms > 1 ? 's' : ''}</p>
        <p className="regular-text" style={{ 
          fontSize: '0.9rem', 
          color: '#7f8c8d',
          lineHeight: '1.4'
        }}>
          {unit.description?.substring(0, 100)}...
        </p>
        
        {unit.available === false ? (
          <button 
            style={{
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              width: '100%',
              marginTop: '1rem',
              cursor: 'not-allowed'
            }}
            onClick={() => alert(`Unit ${unit.unitNumber} is currently not available`)}
          >
            Not Available
          </button>
        ) : (
          <Link to={`/unit/${unit._id}`} style={{ textDecoration: 'none' }}>
            <button 
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                width: '100%',
                marginTop: '1rem',
                cursor: 'pointer'
              }}
            >
              View Unit Details
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default UnitCard