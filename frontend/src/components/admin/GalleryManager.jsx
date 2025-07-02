import React, { useState, useEffect } from 'react'
import { galleryAPI } from '../../services/api'

const GalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'building-exterior',
    sortOrder: 0
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const categories = [
    { value: 'building-exterior', label: 'Building Exterior' },
    { value: 'lobby', label: 'Lobby' },
    { value: 'amenities', label: 'Amenities' },
    { value: 'rooftop', label: 'Rooftop' },
    { value: 'apartments', label: 'Apartments' },
    { value: 'neighborhood', label: 'Neighborhood' }
  ]

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching gallery items for admin...')
      
      const response = await galleryAPI.getAll()
      console.log('Admin gallery response:', response)
      console.log('Response data:', response.data)
      
      // Handle the nested response structure from your backend
      let items = []
      if (response.data && response.data.galleryItems) {
        items = response.data.galleryItems
      } else if (Array.isArray(response.data)) {
        items = response.data
      }
      
      // Convert relative URLs to absolute URLs for display
      const itemsWithAbsoluteUrls = items.map(item => ({
        ...item,
        imageUrl: item.imageUrl.startsWith('http') 
          ? item.imageUrl 
          : `http://localhost:5000${item.imageUrl}`
      }))
      
      console.log('Processed gallery items:', itemsWithAbsoluteUrls)
      setGalleryItems(itemsWithAbsoluteUrls)
      
    } catch (err) {
      console.error('Error fetching gallery:', err)
      console.error('Error response:', err.response?.data)
      setError(`Failed to fetch gallery items: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Please select an image file')
      return
    }

    if (!uploadForm.title.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description)
      formData.append('category', uploadForm.category)
      formData.append('sortOrder', uploadForm.sortOrder)

      console.log('Uploading gallery image...')
      const response = await galleryAPI.upload(formData)
      console.log('Upload response:', response)
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        category: 'building-exterior',
        sortOrder: 0
      })
      setSelectedFile(null)
      const fileInput = document.getElementById('gallery-file-input')
      if (fileInput) fileInput.value = ''
      
      // Refresh gallery
      await fetchGalleryItems()
      alert('Gallery image uploaded successfully!')
      
    } catch (err) {
      console.error('Error uploading gallery image:', err)
      console.error('Upload error response:', err.response?.data)
      alert(`Failed to upload image: ${err.response?.data?.message || err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      const item = galleryItems.find(item => item._id === id)
      console.log('Toggling active status for item:', id, 'from', currentStatus, 'to', !currentStatus)
      
      const response = await galleryAPI.update(id, { 
        ...item, 
        isActive: !currentStatus,
        // Convert back to relative URL for backend
        imageUrl: item.imageUrl.replace('http://localhost:5000', '')
      })
      console.log('Toggle response:', response)
      
      await fetchGalleryItems()
    } catch (err) {
      console.error('Error updating gallery item:', err)
      console.error('Update error response:', err.response?.data)
      alert(`Failed to update item: ${err.response?.data?.message || err.message}`)
    }
  }

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return
    
    try {
      console.log('Deleting gallery item:', id)
      const response = await galleryAPI.delete(id)
      console.log('Delete response:', response)
      
      await fetchGalleryItems()
      alert('Gallery item deleted successfully!')
    } catch (err) {
      console.error('Error deleting gallery item:', err)
      console.error('Delete error response:', err.response?.data)
      alert(`Failed to delete item: ${err.response?.data?.message || err.message}`)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px',
        flexDirection: 'column' 
      }}>
        <div style={{ 
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '15px', color: '#666' }}>Loading gallery...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>Error Loading Gallery</h3>
        <p>{error}</p>
        <button 
          onClick={fetchGalleryItems}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gallery Management</h2>
      
      {/* Debug Info - Remove in production */}
      <div style={{
        backgroundColor: '#e9ecef',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <strong>Debug:</strong> Found {galleryItems.length} gallery items
      </div>
      
      {/* Upload Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Upload New Gallery Image</h3>
        <form onSubmit={handleUpload}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Title *
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Category
              </label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Sort Order
              </label>
              <input
                type="number"
                value={uploadForm.sortOrder}
                onChange={(e) => setUploadForm({...uploadForm, sortOrder: parseInt(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
              rows="2"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Image File *
            </label>
            <input
              id="gallery-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
            {selectedFile && (
              <p style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={uploading}
            style={{
              backgroundColor: uploading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Gallery Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {galleryItems.map(item => (
          <div key={item._id} style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: item.isActive ? '2px solid #28a745' : '2px solid #ccc'
          }}>
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error('Image failed to load:', item.imageUrl)
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.display = 'flex'
                e.target.style.alignItems = 'center'
                e.target.style.justifyContent = 'center'
                e.target.innerHTML = '<span style="color: #999;">Image not found</span>'
              }}
            />
            
            <div style={{ padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{item.title}</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                {item.description || 'No description'}
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{
                  backgroundColor: '#f8f9fa',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {categories.find(cat => cat.value === item.category)?.label || item.category}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  Order: {item.sortOrder}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => toggleActive(item._id, item.isActive)}
                  style={{
                    backgroundColor: item.isActive ? '#ffc107' : '#28a745',
                    color: item.isActive ? 'black' : 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {item.isActive ? 'Hide' : 'Show'}
                </button>
                
                <button
                  onClick={() => deleteItem(item._id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {galleryItems.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3>No gallery items found</h3>
          <p>Upload your first image using the form above!</p>
        </div>
      )}
    </div>
  )
}

export default GalleryManager