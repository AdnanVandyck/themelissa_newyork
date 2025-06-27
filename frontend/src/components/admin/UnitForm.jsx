import React, { useState } from 'react'

const UnitForm = ({ isOpen, onClose, unit, onSave }) => {
  const [formData, setFormData] = useState({
    unitnumber: unit?.unitnumber || '',
    price: unit?.price || '',
    bedrooms: unit?.bedrooms || 0,
    bathrooms: unit?.bathrooms || 1,
    sqft: unit?.sqft || '',
    available: unit?.available !== undefined ? unit.available : true
  })

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
            {unit ? `Edit Unit ${unit.unitnumber}` : 'Add New Unit'}
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
          <p>Form fields will go here...</p>
          <p>Unit: {unit ? unit.unitnumber : 'New'}</p>
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
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
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