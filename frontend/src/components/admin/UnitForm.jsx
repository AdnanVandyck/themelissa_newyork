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
    <div>
      <h2>Unit Form</h2>
      <p>This will be our unit form!</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default UnitForm