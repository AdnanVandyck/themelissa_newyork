// import React from 'react'
// import UnitCard from '../components/units/UnitCard'
// import { unitAPI } from '../services/api'

// // const sampleUnits = [{
// //   _id: 1,
// //   unitNumber: '3A',
// //   price: 3500,
// //   bedrooms: 0,
// //   bathrooms: 1,
// //   available: true,
// //   image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
// // },
// // {
// //   _id: 2,
// //   unitNumber: '2A',
// //   price: 4500,
// //   bedrooms: 2,
// //   bathrooms: 1.5,
// //   available: true,
// //   image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
// // },
// // {
// //   _id: 3,
// //   unitNumber: '5A',
// //   price: 6600,
// //   bedrooms: 1,
// //   bathrooms: 1,
// //   available: true,
// //   image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
// // },
// // {
// //   _id: 4,
// //   unitNumber: '4B',
// //   price: 6500,
// //   bedrooms: 2,
// //   bathrooms: 2,
// //   available: false,
// //   image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
// // }
// // ]

// const Home = () => {

//   const [units, setUnits] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   return (
//     <div>
//       {/* Simple Hero Section */}
//       <div style={{
//         backgroundColor: 'black',
//         color: 'white',
//         padding: '3rem 2rem',
//         textAlign: 'center'
//       }}>
//         <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//           The Melissa NYC
//         </h1>
//         <p style={{ fontSize: '1.2rem' }}>
//           Luxury Apartments in the Upper East Side
//         </p>

//         <button style={{
//           backgroundColor: 'white',
//           color: 'black',
//           border: 'none',
//           padding: '1rem 2rem',
//           borderRadius: '25px',
//           fontSize: '1.1rem',
//           fontWeight: 'bold',
//           cursor: 'pointer'
//         }}
//         onClick={() => alert('Button works!')}
//         >
//           View Units
//         </button>
//       </div>
//       {/* Show All Units - Simple List */}
//         <div style={{ padding: '2rem' }}>
//         <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Available Units</h2>
        
//         <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',  // ← Grid layout
//                 gap: '2rem',
//                 maxWidth: '1200px',
//                 margin: '0 auto'
//         }}>
//             {sampleUnits.map((unit) => (
//             <UnitCard key={unit._id} unit={unit} />
//             ))}
//         </div>
//         </div>
//     </div>
//   )
// }

// export default Home

import React, { useState, useEffect } from 'react'
import UnitCard from '../components/units/UnitCard'
import { unitAPI } from '../services/api'

const Home = () => {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch units from backend on component mount
  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching units from:', `http://localhost:5000/api/units`)
      
      const response = await unitAPI.getAll()
      console.log('API Response:', response.data)
      setUnits(response.data)
    } catch (err) {
      console.error('Error fetching units:', err)
      setError(`Failed to connect to backend: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Loading units from backend...</h2>
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
        <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
          Connecting to http://localhost:5000/api/units
        </p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Connection Error</h2>
        <p style={{ color: '#e74c3c', marginBottom: '2rem' }}>{error}</p>
        <button 
          onClick={fetchUnits}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Try Again
        </button>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <h4>Troubleshooting:</h4>
          <p>1. Make sure your backend is running on port 5000</p>
          <p>2. Check that MongoDB is connected</p>
          <p>3. Verify the API route exists: <code>/api/units</code></p>
        </div>
      </div>
    )
  }

  // Calculate stats from real data
  const availableUnits = units.filter(unit => unit.available)
  const startingPrice = units.length > 0 ? Math.min(...units.map(unit => unit.price)) : 0
  
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'black',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 className="main-heading" style={{ 
          color: 'white', 
          fontSize: '3.5rem', 
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          The Melissa NYC
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          marginBottom: '0.5rem',
          fontWeight: '300'
        }}>
          Luxury Apartments in the Heart of the Upper East Side
        </p>
        <p style={{ 
          fontSize: '1.1rem', 
          opacity: '0.9',
          fontStyle: 'italic'
        }}>
          Powered by Summit Leasing Services
        </p>
      </div>

      {/* Stats Section */}
      <div style={{ 
        padding: '3rem 2rem', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        marginBottom: '3rem'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '3rem',
          color: '#2c3e50',
          fontWeight: '300'
        }}>
          {/* Live Data from Backend */}
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div>
            <h3 style={{ 
              color: '#3498db', 
              fontSize: '3rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {units.length}
            </h3>
            <p style={{ 
              color: '#7f8c8d', 
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              Total Units
            </p>
          </div>
          
          <div>
            <h3 style={{ 
              color: '#27ae60', 
              fontSize: '3rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              {availableUnits.length}
            </h3>
            <p style={{ 
              color: '#7f8c8d', 
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              Available Units
            </p>
          </div>
          
          <div>
            <h3 style={{ 
              color: '#e74c3c', 
              fontSize: '3rem', 
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              ${startingPrice.toLocaleString()}
            </h3>
            <p style={{ 
              color: '#7f8c8d', 
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              Starting Rent
            </p>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div id="units-section" style={{ padding: '0 2rem 4rem' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '3rem',
          textAlign: 'center',
          color: '#2c3e50',
          fontWeight: '300'
        }}>
          Available Units ({units.length})
        </h2>
        
        {units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h3>No units in database</h3>
            <p>The backend is connected, but there are no units yet.</p>
            <p>Use the admin dashboard to add some units!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {units.map((unit) => (
              <UnitCard key={unit._id} unit={unit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home