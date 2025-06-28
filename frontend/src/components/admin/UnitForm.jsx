import React, { useState, useEffect } from 'react'

const UnitForm = ({ isOpen, onClose, unit, onSave }) => {
  const [formData, setFormData] = useState({
    unitNumber: '',
    description: '',
    price: '',
    bedrooms: 0,
    bathrooms: 1,
    imageURL: '',
    available: true
  })

  // Update form data when modal opens or unit changes
  useEffect(() => {
    if (isOpen) {
      if (unit) {
        // Editing existing unit
        setFormData({
          unitNumber: unit.unitNumber || '',
          description: unit.description || '',
          price: unit.price.toString() || '',
          bedrooms: unit.bedrooms || 0,
          bathrooms: unit.bathrooms || 1,
          imageURL: unit.imageURL || '',
          available: unit.available !== undefined ? unit.available : true
        })
      } else {
        // Adding new unit - reset to empty
        setFormData({
          unitNumber: '',
          description: '',
          price: '',
          bedrooms: 0,
          bathrooms: 1,
          imageURL: '',
          available: true
        })
      }
    }
  }, [isOpen, unit])

  // Form validation
  const isFormValid = () => {
    return formData.unitNumber.trim() !== '' && 
           formData.description.trim() !== '' &&
           formData.price !== '' && 
           parseInt(formData.price) > 0
  }

  if (!isOpen) return null

  return (
    // Modal Overlay
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {/* Modal Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h2 style={{ margin: 0 }}>
            {unit ? `Edit Unit ${unit.unitNumber}` : 'Add New Unit'}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Unit Number */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold' 
              }}>
                Unit Number (max 5 characters)
              </label>
              <input
                type="text"
                maxLength="5"
                value={formData.unitNumber}
                onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                placeholder="e.g., 3A, 5B, 12A"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold' 
              }}>
                Description (max 500 characters)
              </label>
              <textarea
                maxLength="500"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the unit features and amenities..."
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
              <small style={{ color: '#6c757d' }}>
                {formData.description.length}/500 characters
              </small>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold' 
              }}>
                Monthly Rent ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="e.g., 3500"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Bedrooms and Bathrooms Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold' 
                }}>
                  Bedrooms
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value={0}>Studio</option>
                  <option value={1}>1 Bedroom</option>
                  <option value={2}>2 Bedrooms</option>
                  <option value={3}>3 Bedrooms</option>
                  <option value={4}>4 Bedrooms</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold' 
                }}>
                  Bathrooms
                </label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value={1}>1 Bathroom</option>
                  <option value={1.5}>1.5 Bathrooms</option>
                  <option value={2}>2 Bathrooms</option>
                  <option value={2.5}>2.5 Bathrooms</option>
                  <option value={3}>3 Bathrooms</option>
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold' 
              }}>
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.imageURL}
                onChange={(e) => setFormData({...formData, imageURL: e.target.value})}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <small style={{ color: '#6c757d' }}>
                Leave empty to use default image
              </small>
              
              {/* Image Preview */}
              {formData.imageURL && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img 
                    src={formData.imageURL} 
                    alt="Preview"
                    style={{
                      width: '100px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Available Checkbox */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({...formData, available: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: 'bold' }}>Unit is available for rent</span>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!isFormValid()}
            style={{
              backgroundColor: isFormValid() ? '#28a745' : '#95a5a6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: isFormValid() ? 'pointer' : 'not-allowed'
            }}
          >
            Save Unit
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnitForm