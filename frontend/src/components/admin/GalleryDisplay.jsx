import React, { useState, useEffect } from 'react'
import { galleryAPI, getImageUrl } from '../../services/api.js' // Added getImageUrl import

const GalleryDisplay = () => {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)

  // const categories = [
  //   { value: '', label: 'All' },
  //   { value: 'building-exterior', label: 'Building' },
  //   { value: 'lobby', label: 'Lobby' },
  //   { value: 'amenities', label: 'Amenities' },
  //   { value: 'rooftop', label: 'Rooftop' },
  //   { value: 'apartments', label: 'Apartments' },
  //   { value: 'neighborhood', label: 'Neighborhood' }
  // ]

  useEffect(() => {
    fetchGalleryItems()
  }, [selectedCategory])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching gallery with category:', selectedCategory)
      
      const response = await galleryAPI.getPublic(selectedCategory)
      
      console.log('Gallery API Response:', response)
      console.log('Gallery Data:', response.data)
      
      // Your backend returns the array directly
      const items = Array.isArray(response.data) ? response.data : []
      
      // FIXED: Use getImageUrl helper instead of hardcoded localhost
      const itemsWithAbsoluteUrls = items.map(item => ({
        ...item,
        imageUrl: getImageUrl(item.imageUrl) // Use the helper function
      }))
      
      console.log('Processed gallery items:', itemsWithAbsoluteUrls)
      setGalleryItems(itemsWithAbsoluteUrls)
      
    } catch (error) {
      console.error('Error fetching gallery:', error)
      console.error('Error response:', error.response?.data)
      setError(`Failed to load gallery: ${error.message}`)
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (item) => {
    setLightboxImage(item)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading gallery...</p>
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
        textAlign: 'center',
        padding: '60px 20px',
        color: '#e74c3c',
        backgroundColor: '#f8f8f8',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Gallery Error</h3>
        <p style={{ marginBottom: '20px' }}>{error}</p>
        <button
          onClick={fetchGalleryItems}
          style={{
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>

      {/* Category Filter
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '40px'
      }}>
        {categories.map(category => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            style={{
              backgroundColor: selectedCategory === category.value ? '#000' : 'transparent',
              color: selectedCategory === category.value ? 'white' : '#333',
              border: '1px solid #333',
              padding: '8px 16px',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category.value) {
                e.target.style.backgroundColor = '#f0f0f0'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category.value) {
                e.target.style.backgroundColor = 'transparent'
              }
            }}
          >
            {category.label}
          </button>
        ))}
      </div> */}

      {/* Gallery Grid */}
      {galleryItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666',
          backgroundColor: '#f8f8f8',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginBottom: '15px', fontWeight: '300' }}>No Gallery Images Found</h3>
          <p style={{ marginBottom: '20px' }}>
            {selectedCategory 
              ? `No images in the "${categories.find(c => c.value === selectedCategory)?.label}" category.`
              : 'No gallery images have been uploaded yet.'
            }
          </p>
          <p style={{ fontSize: '14px', opacity: '0.8' }}>
            Add images through the admin dashboard to populate the gallery.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {galleryItems.map((item, index) => (
            <div
              key={item._id}
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                height: '250px'
              }}
              onClick={() => openLightbox(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
                
                const overlay = e.currentTarget.querySelector('.gallery-overlay')
                if (overlay) {
                  overlay.style.transform = 'translateY(0)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
                
                const overlay = e.currentTarget.querySelector('.gallery-overlay')
                if (overlay) {
                  overlay.style.transform = 'translateY(100%)'
                }
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', item.imageUrl)
                  // Show a placeholder instead of hiding
                  e.target.style.backgroundColor = '#f0f0f0'
                  e.target.style.display = 'flex'
                  e.target.style.alignItems = 'center'
                  e.target.style.justifyContent = 'center'
                  e.target.innerHTML = '<span style="color: #999;">Image not found</span>'
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', item.imageUrl)
                }}
              />
              
              <div 
                className="gallery-overlay"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  padding: '20px',
                  transform: 'translateY(100%)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '500' }}>
                  {item.title}
                </h4>
                {item.description && (
                  <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
                    {item.description}
                  </p>
                )}
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: '0.7' }}>
                  Category: {item.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={closeLightbox}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%'
          }}>
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontWeight: '300' }}>
                {lightboxImage.title}
              </h3>
              {lightboxImage.description && (
                <p style={{ margin: '0', opacity: '0.8' }}>
                  {lightboxImage.description}
                </p>
              )}
            </div>
            
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryDisplay