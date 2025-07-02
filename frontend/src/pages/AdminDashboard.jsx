import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UnitForm from '../components/admin/UnitForm'
import ImageUploader from '../components/admin/ImageUploader'
import ContactManager from '../components/admin/ContactManager'
import { unitAPI, contactAPI } from '../services/api'
import GalleryManager from '../components/admin/GalleryManager'


const AdminDashboard = () => {
  const [units, setUnits] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [activeTab, setActiveTab] = useState('units') // New state for tabs
  
  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === 'units') {
      fetchUnits()
    } else if (activeTab === 'contacts') {
      fetchContacts()
    }
  }, [activeTab])

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

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Admin: Fetching contacts from backend...')
      
      const response = await contactAPI.getAll()
      console.log('Admin: Contacts fetched:', response.data)
      setContacts(response.data.contacts)
    } catch (err) {
      console.error('Admin: Error fetching contacts:', err)
      setError(`Failed to fetch contacts: ${err.message}`)
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

  // Handle image management
  const handleManageImages = (unit) => {
    console.log('Managing images for unit:', unit.unitNumber)
    setSelectedUnit(unit)
    setShowImageUploader(true)
  }

  const handleCloseImageUploader = () => {
    setShowImageUploader(false)
    setSelectedUnit(null)
  }

  const handleImagesUpdated = async () => {
    // Refresh the specific unit data after images are updated
    if (selectedUnit) {
      try {
        const response = await unitAPI.getById(selectedUnit._id)
        const updatedUnit = response.data
        
        // Update the unit in the units array
        setUnits(units.map(unit => 
          unit._id === selectedUnit._id ? updatedUnit : unit
        ))
        
        // Update the selected unit for the image uploader
        setSelectedUnit(updatedUnit)
        
        console.log('Unit images refreshed successfully')
      } catch (error) {
        console.error('Error refreshing unit data:', error)
      }
    }
  }

  // Helper function to get total image count
  const getImageCount = (unit) => {
    let count = 0
    if (unit.imageURL) count++
    if (unit.images) count += unit.images.length
    return count
  }

  // Get new contacts count
  const newContactsCount = contacts.filter(contact => contact.status === 'new').length

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
          onClick={activeTab === 'units' ? fetchUnits : fetchContacts}
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
            Connected to backend • Manage units and contact inquiries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'units' && (
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
          )}
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

      {/* Tab Navigation */}
      <div style={{ 
        marginBottom: '2rem',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('units')}
            style={{
              backgroundColor: activeTab === 'units' ? '#000' : 'transparent',
              color: activeTab === 'units' ? 'white' : '#666',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              borderBottom: activeTab === 'units' ? '3px solid #000' : '3px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Units Management
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            style={{
              backgroundColor: activeTab === 'contacts' ? '#000' : 'transparent',
              color: activeTab === 'contacts' ? 'white' : '#666',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              borderBottom: activeTab === 'contacts' ? '3px solid #000' : '3px solid transparent',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            Contact Inquiries
            {newContactsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {newContactsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              backgroundColor: activeTab === 'gallery' ? '#000' : 'transparent',
              color: activeTab === 'gallery' ? 'white' : '#666',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              borderBottom: activeTab === 'gallery' ? '3px solid #000' : '3px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Gallery
          </button>

        </div>
      </div>
      
      {/* Units Tab Content */}
      {activeTab === 'units' && (
        <>
          {/* Quick Stats for Units */}
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
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f3e5f5', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#7b1fa2', margin: 0 }}>
                {units.reduce((total, unit) => total + getImageCount(unit), 0)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Images</p>
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
                    Unit Number
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Price
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Beds/Baths
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Images
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
                    <td colSpan="6" style={{ 
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
                        ${(unit.price)?.toLocaleString()}/mo
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms}bd`} / {unit.bathrooms}ba
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.9rem',
                            color: getImageCount(unit) > 0 ? '#28a745' : '#6c757d'
                          }}>
                            {getImageCount(unit)} image{getImageCount(unit) !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => handleManageImages(unit)}
                            style={{
                              backgroundColor: '#6f42c1',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                          >
                            Manage
                          </button>
                        </div>
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
        </>
      )}

      {/* Contacts Tab Content */}
      {activeTab === 'contacts' && (
        <ContactManager />
      )}

      {/* Gallery tab content */}
      {activeTab === 'gallery' && (
        <GalleryManager />
      )}

      {/* Unit Form Modal */}
      <UnitForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        unit={editingUnit}
        onSave={handleSaveUnit}
      />

      {/* Image Uploader Modal */}
      {showImageUploader && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ margin: 0 }}>
                Manage Images - Unit {selectedUnit?.unitNumber}
              </h2>
              <button
                onClick={handleCloseImageUploader}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
            
            <ImageUploader 
              unit={selectedUnit} 
              onImagesUpdated={handleImagesUpdated}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard