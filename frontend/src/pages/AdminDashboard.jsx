import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UnitForm from '../components/admin/UnitForm'
import { unitAPI } from '../services/api'

const AdminDashboard = () => {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  
  // Fetch units from backend on component mount
  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Admin: Fetching units from backend...')
      
      const response = await unitAPI.getAll()
      console.log('Admin: Units fetched:', response.data)
      setUnits(response.data)
    } catch (err) {
      console.error('Admin: Error fetching units:', err)
      setError(`Failed to fetch units: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = '/admin/login'
    }
  }
  
  const handleToggleAvailability = async (unitId) => {
    try {
      const unit = units.find(u => u._id === unitId)
      const updatedData = { 
        ...unit, 
        available: !unit.available 
      }
      
      console.log('Toggling availability for unit:', unitId, 'to:', !unit.available)
      const response = await unitAPI.update(unitId, updatedData)
      
      // Update local state with response from backend
      setUnits(units.map(u => 
        u._id === unitId ? response.data : u
      ))
      
      console.log('Availability updated successfully')
    } catch (err) {
      console.error('Error toggling availability:', err)
      alert(`Failed to update availability: ${err.response?.data?.message || err.message}`)
    }
  }
  
  const handleDeleteUnit = async (unitId) => {
    const unit = units.find(u => u._id === unitId)
    if (confirm(`Are you sure you want to delete Unit ${unit.unitNumber}?`)) {
      try {
        console.log('Deleting unit:', unitId)
        await unitAPI.delete(unitId)
        
        // Update local state
        setUnits(units.filter(u => u._id !== unitId))
        alert(`Unit ${unit.unitNumber} deleted successfully!`)
      } catch (err) {
        console.error('Error deleting unit:', err)
        alert(`Failed to delete unit: ${err.response?.data?.message || err.message}`)
      }
    }
  }

  const handleAddUnit = () => {
    setEditingUnit(null)
    setIsFormOpen(true)
  }

  const handleEditUnit = (unit) => {
    console.log('Editing unit:', unit)
    setEditingUnit(unit)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingUnit(null)
  }

  const handleSaveUnit = async (unitData) => {
    try {
      if (editingUnit) {
        // Editing existing unit
        console.log('Updating unit:', editingUnit._id, unitData)
        const response = await unitAPI.update(editingUnit._id, unitData)
        
        // Update local state with response from backend
        setUnits(units.map(unit => 
          unit._id === editingUnit._id ? response.data : unit
        ))
        alert(`Unit ${unitData.unitNumber} updated successfully!`)
      } else {
        // Adding new unit
        console.log('Creating new unit:', unitData)
        const response = await unitAPI.create(unitData)
        
        // Add new unit to local state
        setUnits([response.data, ...units])
        alert(`Unit ${unitData.unitNumber} added successfully!`)
      }
      setIsFormOpen(false)
      setEditingUnit(null)
    } catch (err) {
      console.error('Error saving unit:', err)
      alert(`Failed to save unit: ${err.response?.data?.message || err.message}`)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading dashboard...</h2>
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
        <p style={{ color: '#7f8c8d' }}>Connecting to backend...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Dashboard Error</h2>
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
            marginRight: '1rem'
          }}
        >
          Retry Connection
        </button>
        <Link to="/admin/login">
          <button style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Back to Login
          </button>
        </Link>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '2rem' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 className="main-heading" style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            Connected to backend • {units.length} total units in database
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAddUnit}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Add Unit
          </button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              View Site
            </button>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
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
          <h2 style={{ margin: 0 }}>Unit Management (Live Database)</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                Unit Number
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
          
          {units.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="5" style={{ 
                  padding: '3rem', 
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  <div>
                    <h4>No Units in Database</h4>
                    <p>The backend is connected, but there are no units yet.</p>
                    <button
                      onClick={handleAddUnit}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Your First Unit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {units.map((unit) => (
                <tr key={unit._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>
                    <strong>Unit {unit.unitNumber}</strong>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    ${unit.price}/mo
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms}bd`} / {unit.bathrooms}ba
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleToggleAvailability(unit._id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        backgroundColor: unit.available ? '#d4edda' : '#f8d7da',
                        color: unit.available ? '#155724' : '#721c24',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {unit.available ? 'Available' : 'Not Available'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link to={`/unit/${unit._id}`} style={{ textDecoration: 'none' }}>
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
                    </Link>
                    <button 
                      onClick={() => handleEditUnit(unit)}
                      style={{
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUnit(unit._id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Unit Form Modal */}
      <UnitForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        unit={editingUnit}
        onSave={handleSaveUnit}
      />
    </div>
  )
}

export default AdminDashboard