

import React, { useState, useCallback } from 'react';
import { unitAPI } from '../../services/api';

// Smart environment detection for image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Smart API URL detection based on current window location
  const currentHost = window.location.hostname;
  let baseUrl;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    baseUrl = 'http://localhost:5000';
  } else if (currentHost.includes('192.168.') || currentHost.includes('10.') || currentHost.includes('172.')) {
    // Network/mobile testing
    baseUrl = `http://${currentHost.split(':')[0]}:5000`;
  } else if (currentHost === 'themelissanyc.com') {
    baseUrl = 'https://themelissa-backend.onrender.com';
  } else {
    // Fallback to production
    baseUrl = 'https://themelissa-backend.onrender.com';
  }
  
  // Ensure imagePath starts with / for proper URL construction
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${cleanPath}`;
};

const ImageDisplay = ({ src, alt, style, onError, onLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const handleLoad = () => {
    setLoading(false);
    setError(false);
    if (onLoad) onLoad();
  };
  
  const handleError = (e) => {
    console.error('Image failed to load:', src);
    setLoading(false);
    setError(true);
    if (onError) onError(e);
  };
  
  const processedSrc = getImageUrl(src);
  
  return (
    <div style={{ position: 'relative', ...style }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <span style={{ color: '#6c757d', fontSize: '12px' }}>Loading...</span>
        </div>
      )}
      {error ? (
        <div style={{
          width: '100%',
          height: '100px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #ddd',
          color: '#6c757d',
          fontSize: '12px'
        }}>
          Failed to load
        </div>
      ) : (
        <img
          src={processedSrc}
          alt={alt}
          style={{
            ...style,
            display: loading ? 'none' : 'block'
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

const ImageUploader = ({ unit, onImagesUpdated }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (max 10MB per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum size is 10MB per file.`);
      return;
    }
    
    setSelectedFiles(files);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      console.log('Uploading', selectedFiles.length, 'images...');
      
      // Step 1: Upload images to server
      const uploadResponse = await unitAPI.uploadImages(selectedFiles);
      console.log('Upload response:', uploadResponse.data);
      
      // Step 2: Add image URLs to the unit
      if (unit && unit._id) {
        const addResponse = await unitAPI.addImagesToUnit(unit._id, uploadResponse.data.imageUrls);
        console.log('Add to unit response:', addResponse.data);
      }
      
      setSuccess(`Successfully uploaded ${uploadResponse.data.count} images!`);
      setSelectedFiles([]);
      
      // Clear the file input
      const fileInput = document.getElementById('image-upload-input');
      if (fileInput) fileInput.value = '';
      
      // Notify parent component to refresh unit data
      if (onImagesUpdated) {
        onImagesUpdated();
      }
      
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageIndex) => {
    if (!unit || !unit._id) return;
    
    if (!window.confirm('Are you sure you want to remove this image?')) return;

    try {
      setError('');
      setSuccess('');
      
      const response = await unitAPI.removeImageFromUnit(unit._id, imageIndex);
      console.log('Remove image response:', response.data);
      
      setSuccess('Image removed successfully!');
      
      // Notify parent component to refresh unit data
      if (onImagesUpdated) {
        onImagesUpdated();
      }
      
    } catch (err) {
      console.error('Error removing image:', err);
      setError(err.response?.data?.message || 'Failed to remove image');
    }
  };

  // Safely build images array
  const allImages = [];
  if (unit?.imageURL && unit.imageURL.trim()) {
    allImages.push(unit.imageURL);
  }
  if (unit?.images && Array.isArray(unit.images)) {
    allImages.push(...unit.images.filter(img => img && img.trim()));
  }

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Unit Images</h3>
      
      {/* Current Images */}
      {allImages.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4>Current Images ({allImages.length})</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {allImages.map((image, index) => (
              <div key={`${unit._id}-${index}-${image}`} style={{ position: 'relative' }}>
                <ImageDisplay
                  src={image}
                  alt={`Unit ${unit.unitNumber || unit._id} - Image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                  onError={() => console.error(`Failed to load image ${index + 1}:`, image)}
                />
                <button
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Images */}
      <div>
        <h4>Upload New Images</h4>
        
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            position: 'relative'
          }}>
            {error}
            <button
              onClick={clearMessages}
              style={{
                position: 'absolute',
                top: '5px',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#721c24',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            position: 'relative'
          }}>
            {success}
            <button
              onClick={clearMessages}
              style={{
                position: 'absolute',
                top: '5px',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#155724',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <input
            id="image-upload-input"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '5px',
              width: '100%'
            }}
          />
          
          {selectedFiles.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Selected files:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                {selectedFiles.map((file, index) => (
                  <li key={index} style={{ fontSize: '0.9rem', color: '#666' }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          style={{
            backgroundColor: uploading ? '#95a5a6' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '5px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading || selectedFiles.length === 0 ? 0.7 : 1
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;