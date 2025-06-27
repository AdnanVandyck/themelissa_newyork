import React from 'react'


const UnitCard = ({ unit }) => {
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
            src={unit.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
            alt={unit.title}
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
                ${unit.price}/mo
            </div>
            {unit.available && (
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: unit.available ? '#27ae60' : '#e74c3c',
                color: 'white',
                padding: '0.3rem 0.8rem',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
            }}>
                {unit.available ? 'Available' : 'Not Available'}
            </div>
        )}
        </div>


      <div style={{ padding: '1.5rem'}}>
      <h4 className="unit-title">{unit.unitnumber}</h4>
      <p className="regular-text">{unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bedrooms`}</p>
      <p className="regular-text">{unit.bathrooms} Bathroom{unit.bathrooms > 1 ? 's' : ''}</p>

        <button 
          style={{
            backgroundColor: unit.available ? '#3498db' : '#95a5a6',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            width: '100%',
            marginTop: '1rem',
            cursor: unit.available ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            if (unit.available) {
              alert(`View details for ${unit.title}`)
            } else {
              alert(`${unit.title} is currently not available`)
            }
          }}
          onMouseEnter={(e) => {
            if (unit.available) {
              e.target.style.backgroundColor = '#2980b9'
            }
          }}
          onMouseLeave={(e) => {
            if (unit.available) {
              e.target.style.backgroundColor = '#3498db'
            }
          }}
        >
          {unit.available ? 'View Unit Details' : 'Not Available'} 
        </button>
      </div>
    </div>
  )
}

export default UnitCard