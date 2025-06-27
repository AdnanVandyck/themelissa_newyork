import React from 'react'
import UnitCard from '../components/units/UnitCard'

const sampleUnits = [{
  _id: 1,
  unitnumber: '3A',
  price: 3500,
  bedrooms: 0,
  bathrooms: 1,
  available: true,
  image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: 2,
  unitnumber: '2A',
  price: 4500,
  bedrooms: 2,
  bathrooms: 1.5,
  available: true,
  image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: 3,
  unitnumber: '5A',
  price: 6600,
  bedrooms: 1,
  bathrooms: 1,
  available: true,
  image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: 4,
  unitnumber: '4B',
  price: 6500,
  bedrooms: 2,
  bathrooms: 2,
  available: false,
  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
}
]

const Home = () => {
  return (
    <div>
      {/* Simple Hero Section */}
      <div style={{
        backgroundColor: 'black',
        color: 'white',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          The Melissa NYC
        </h1>
        <p style={{ fontSize: '1.2rem' }}>
          Luxury Apartments in the Upper East Side
        </p>

        <button style={{
          backgroundColor: 'white',
          color: 'black',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '25px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button works!')}
        >
          View Units
        </button>
      </div>
      {/* Show All Units - Simple List */}
        <div style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Available Units</h2>
        
        <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',  // ← Grid layout
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto'
        }}>
            {sampleUnits.map((unit) => (
            <UnitCard key={unit._id} unit={unit} />
            ))}
        </div>
        </div>
    </div>
  )
}

export default Home