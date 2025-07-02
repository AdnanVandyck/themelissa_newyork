import React, { useState } from 'react'
import { validateEmail, validateRequired } from '../utils/helpers'
import { contactAPI } from '../services/api'


const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moveInDate: '',
    budgetRange: '',
    bedrooms: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const budgetRanges = [
    'Under $2,000',
    '$2,000 - $3,000',
    '$3,000 - $4,000',
    '$4,000 - $5,000',
    '$5,000 - $7,000',
    'Over $7,000'
  ]

  const bedroomOptions = [
    'Studio',
    '1 Bedroom',
    '2 Bedrooms',
    '3+ Bedrooms',
    'Flexible'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required field validations
    if (!validateRequired(formData.firstName).isValid) {
      newErrors.firstName = 'First name is required'
    }
    if (!validateRequired(formData.lastName).isValid) {
      newErrors.lastName = 'Last name is required'
    }
    if (!validateRequired(formData.email).isValid) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!validateRequired(formData.phone).isValid) {
      newErrors.phone = 'Phone number is required'
    }
    if (!validateRequired(formData.moveInDate).isValid) {
      newErrors.moveInDate = 'Move-in date is required'
    }
    if (!validateRequired(formData.budgetRange).isValid) {
      newErrors.budgetRange = 'Budget range is required'
    }
    if (!validateRequired(formData.bedrooms).isValid) {
      newErrors.bedrooms = 'Bedroom preference is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!validateForm()) {
    return
  }

  setLoading(true)
  
  try {
    console.log('Submitting contact form:', formData)
    
    const response = await contactAPI.submitForm(formData)
    
    if (response.data.success) {
      console.log('Contact form submitted successfully:', response.data)
      setSuccess(true)
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        moveInDate: '',
        budgetRange: '',
        bedrooms: '',
        message: ''
      })
    } else {
      throw new Error(response.data.message || 'Submission failed')
    }
    
  } catch (error) {
    console.error('Error submitting form:', error)
    
    if (error.response?.data?.errors) {
      // Handle validation errors from backend
      const backendErrors = error.response.data.errors
      alert('Please check your form: ' + backendErrors.join(', '))
    } else {
      alert(error.response?.data?.message || 'There was an error submitting your request. Please try again.')
    }
  } finally {
    setLoading(false)
  }
}

  if (success) {
    return (
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '60px 40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '300',
            color: '#333',
            marginBottom: '30px'
          }}>
            Thank You!
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            We've received your inquiry and our leasing team will contact you within 24 hours to schedule your private tour of The Melissa.
          </p>
          <button
            onClick={() => setSuccess(false)}
            style={{
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginRight: '15px'
            }}
          >
            Submit Another Request
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: 'transparent',
              color: '#333',
              border: '2px solid #333',
              padding: '15px 30px',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="no-header-spacing">
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(./melissa-front.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        padding: '200px 0 180px 0',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '300',
            marginBottom: '30px',
            letterSpacing: '-1px'
          }}>
            Contact Our Leasing Team
          </h1>
          <p style={{
            fontSize: '18px',
            opacity: '0.9',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Ready to make The Melissa your new home? Fill out the form below and our team will contact you to schedule a private tour.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section style={{
        padding: '100px 0',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: '60px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            {/* Name Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: errors.firstName ? '2px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0',
                    fontSize: '16px',
                    backgroundColor: '#fff'
                  }}
                />
                {errors.firstName && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                    {errors.firstName}
                  </span>
                )}
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: errors.lastName ? '2px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0',
                    fontSize: '16px',
                    backgroundColor: '#fff'
                  }}
                />
                {errors.lastName && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: errors.email ? '2px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0',
                    fontSize: '16px',
                    backgroundColor: '#fff'
                  }}
                />
                {errors.email && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                    {errors.email}
                  </span>
                )}
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: errors.phone ? '2px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0',
                    fontSize: '16px',
                    backgroundColor: '#fff'
                  }}
                />
                {errors.phone && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Desired Move-in Date *
                </label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: errors.moveInDate ? '2px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0',
                    fontSize: '16px',
                    backgroundColor: '#fff'
                  }}
                />
                {errors.moveInDate && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                    {errors.moveInDate}
                  </span>
                )}
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Budget Range *
                </label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: errors.budgetRange ? '2px solid #e74c3c' : '1px solid #ddd',
                    borderRadius: '0',
                    fontSize: '16px',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Select Budget Range</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                    {errors.budgetRange}
                  </span>
                )}
              </div>
            </div>

            {/* Bedroom Preference */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Bedroom Preference *
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: errors.bedrooms ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '0',
                  fontSize: '16px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select Bedroom Preference</option>
                {bedroomOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.bedrooms && (
                <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                  {errors.bedrooms}
                </span>
              )}
            </div>

            {/* Message */}
            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Additional Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about your housing needs, questions, or special requests..."
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '0',
                  fontSize: '16px',
                  backgroundColor: '#fff',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#666' : '#000',
                color: 'white',
                border: 'none',
                padding: '18px 40px',
                borderRadius: '0',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '500',
                width: '100%',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#666',
              marginTop: '20px',
              lineHeight: '1.5'
            }}>
              By submitting this form, you agree to be contacted by our leasing team regarding available units at The Melissa. We respect your privacy and will not share your information with third parties.
            </p>
          </form>
        </div>
      </section>

      {/* Contact Info Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px',
            textAlign: 'center'
          }}>
            
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                marginBottom: '20px',
                color: '#333'
              }}>
                Contact Information
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Phone: (917) 544-8626<br />
                Email: leasing@summitsls.com<br />
              </p>
            </div>
            
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                marginBottom: '20px',
                color: '#333'
              }}>
                Visit Us
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                The Melissa<br />
                308 East 78th Street<br />
                New York, NY 10075
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact