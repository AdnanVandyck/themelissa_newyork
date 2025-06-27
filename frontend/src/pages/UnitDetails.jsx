import React from 'react'
import { useParams, Link } from 'react-router-dom'

const allUnits = [{
  _id: '1',
  unitnumber: '3A',
  price: 3500,
  bedrooms: 0,
  bathrooms: 1,
  available: true,
  description: 'Modern studio apartment with floor-to-ceiling windows, hardwood floors, and premium finishes. Perfect for young professionals seeking luxury in the heart of the Upper East Side.',
  image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: '2',
  unitnumber: '2A',
  price: 4500,
  bedrooms: 2,
  bathrooms: 1.5,
  available: true,
  description: 'Spacious one-bedroom with separate living area, modern kitchen with stainless steel appliances, and stunning city views. Includes in-unit washer/dryer.',
  image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: '3',
  unitnumber: '5A',
  price: 6600,
  bedrooms: 1,
  bathrooms: 1,
  available: true,
  description: 'Elegant two-bedroom, two-bathroom apartment with open floor plan, chef\'s kitchen, and private balcony. Master suite with walk-in closet and en-suite bathroom.',
  image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
},
{
  _id: '4',
  unitnumber: '4B',
  price: 6500,
  bedrooms: 2,
  bathrooms: 2,
  available: false,
  description: 'Elegant two-bedroom, two-bathroom apartment with open floor plan, chef\'s kitchen, and private balcony. Master suite with walk-in closet and en-suite bathroom.',
  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
}
]

const UnitDetails = () => {
  const { id } = useParams()
  
  const unit = allUnits.find(u => u._id === id)

  if (!unit) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Unit Not Found</h1>
        <p>Sorry, we couldn't find a unit with ID: {id}</p>
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
          src={unit.image}
          alt={unit.title}
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
        <h1 className="unit-title">{unit.unitnumber}</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <p><strong>Price:</strong> ${unit.price}/month</p>
          <p><strong>Bedrooms:</strong> {unit.bedrooms === 0 ? 'Studio' : unit.bedrooms}</p>
          <p><strong>Bathrooms:</strong> {unit.bathrooms}</p>
        </div>
        
        <div style={{
          padding: '1rem',
          backgroundColor: unit.available ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <strong>Status: {unit.available ? 'Available' : 'Not Available'}</strong>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Description</h3>
          <p style={{ lineHeight: '1.6' }}>{unit.description}</p>
        </div>
      </div>
    </div>
  )
}





export default UnitDetails