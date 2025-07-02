import React, { useState, useEffect } from 'react'
import { contactAPI } from '../../services/api'

const ContactManager = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [statusFilter])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = statusFilter ? { status: statusFilter } : {}
      const response = await contactAPI.getAll(params)
      setContacts(response.data.contacts)
    } catch (err) {
      setError('Failed to fetch contacts')
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateContactStatus = async (contactId, status, notes = '') => {
    try {
      await contactAPI.updateStatus(contactId, { status, notes })
      fetchContacts() // Refresh the list
      alert('Contact status updated successfully')
    } catch (err) {
      alert('Failed to update contact status')
      console.error('Error updating contact:', err)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const statusColors = {
    new: '#e74c3c',
    contacted: '#f39c12',
    scheduled: '#3498db',
    completed: '#27ae60',
    declined: '#95a5a6'
  }

  if (loading) return <div>Loading contacts...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2>Contact Inquiries ({contacts.length})</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div style={{
        display: 'grid',
        gap: '20px'
      }}>
        {contacts.map(contact => (
          <div key={contact._id} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'start',
              gap: '20px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>
                  {contact.firstName} {contact.lastName}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Phone:</strong> {contact.phone}</p>
                  <p><strong>Move-in:</strong> {formatDate(contact.moveInDate)}</p>
                  <p><strong>Budget:</strong> {contact.budgetRange}</p>
                  <p><strong>Bedrooms:</strong> {contact.bedrooms}</p>
                  <p><strong>Submitted:</strong> {formatDate(contact.createdAt)}</p>
                </div>
                {contact.message && (
                  <p style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '4px',
                    margin: '10px 0'
                  }}>
                    <strong>Message:</strong> {contact.message}
                  </p>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  backgroundColor: statusColors[contact.status],
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  textTransform: 'capitalize',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {contact.status}
                </div>
                
                <select
                  value={contact.status}
                  onChange={(e) => updateContactStatus(contact._id, e.target.value)}
                  style={{
                    padding: '5px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          No contact inquiries found.
        </div>
      )}
    </div>
  )
}

export default ContactManager