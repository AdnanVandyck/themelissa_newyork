import React from 'react'
import UnitCard from '../components/units/UnitCard'

const testUnit = {
  unitnumber: '3A',
  price: 3500,
  bedrooms: 0,
  bathrooms: 1,
  available: true,
  image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
}

const TestUnits = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '400px'}}>
      <h1 className="main-heading">Testing Unit Cards</h1>
      <UnitCard unit={testUnit} />
    </div>
  )
}

export default TestUnits