import React from 'react'

const units = [{
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

const AdminDashboard = () => {
return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="main-heading">Admin Dashboard</h1>
        <p style={{ color: '#7f8c8d' }}>
          Welcome back! Manage all units for The Melissa NYC.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1976d2', margin: 0 }}>{units.length}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Units</p>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#2e7d32', margin: 0 }}>{units.filter(u => u.available).length}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Available</p>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#ffebee', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#c62828', margin: 0 }}>{units.filter(u => !u.available).length}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Not Available</p>
        </div>
      </div>
      
      {/* Units Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #dee2e6' 
        }}>
          <h2 style={{ margin: 0 }}>Unit Management</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                Unit
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                Price
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                Beds/Baths
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                Status
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>
                  <strong>{unit.unitnumber}</strong>
                </td>
                <td style={{ padding: '1rem' }}>
                  ${unit.price}/mo
                </td>
                <td style={{ padding: '1rem' }}>
                  {unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms}bd`} / {unit.bathrooms}ba
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    backgroundColor: unit.available ? '#d4edda' : '#f8d7da',
                    color: unit.available ? '#155724' : '#721c24'
                  }}>
                    {unit.available ? 'Available' : 'Not Available'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                  }}>
                    View
                  </button>
                  <button style={{
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard