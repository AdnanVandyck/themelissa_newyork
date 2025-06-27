import React from 'react'
import UnitCard from '../components/units/UnitCard'

const testUnits = [{
  _id: 1,
  unitNumber: '3A',
  price: 3500,
  bedrooms: 0,
  bathrooms: 1,
  available: true,
  image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: 2,
  unitNumber: '2A',
  price: 4500,
  bedrooms: 2,
  bathrooms: 1.5,
  available: true,
  image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: 3,
  unitNumber: '5A',
  price: 6600,
  bedrooms: 1,
  bathrooms: 1,
  available: true,
  image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: 4,
  unitNumber: '4B',
  price: 6500,
  bedrooms: 2,
  bathrooms: 2,
  available: false,
  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
}
]


const TestUnits = () => {
return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 className="main-heading" style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem' }}>
          The Melissa NYC
        </h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
          Luxury Apartments in the Heart of the Upper East Side
        </p>
        <p style={{ fontSize: '1rem', opacity: '0.9' }}>
          Powered by Summit Leasing Services
        </p>
      </div>

      {/* Stats Section */}
       {/* <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        marginBottom: '2rem'
        }}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <div>
            <h3 style={{ color: '#3498db', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {testUnits.filter(unit => unit.available).length}
            </h3>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Available Units</p>
            </div>
            <div>
            <h3 style={{ color: '#27ae60', fontSize: '2rem', marginBottom: '0.5rem' }}>
                ${Math.min(...testUnits.map(unit => unit.price))}+
            </h3>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Starting Rent</p>
            </div>
            <div>
            <h3 style={{ color: '#e74c3c', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {Math.max(...testUnits.map(unit => unit.sqft))}
            </h3>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Max Square Feet</p>
            </div>
        </div>
        </div> */}

      {/* Units Section */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#2c3e50'
        }}>
          Available Units
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {testUnits.map((unit) => (
            <UnitCard key={unit._id} unit={unit} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestUnits