import React, { useState } from 'react';
import { unitAPI } from '../../services/api';

const LayoutUploader = ({ unit, onLayoutUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      console.log('📐 Uploading layout for unit:', unit._id);
      
      // Use the new Cloudinary API endpoint
      const response = await unitAPI.uploadLayout(unit._id, file);
      
      console.log('✅ Layout uploaded successfully:', response.data);
      
      setSuccess('Layout uploaded successfully to Cloudinary!');
      
      // Call the callback to refresh unit data
      if (onLayoutUpdated) {
        onLayoutUpdated();
      }
      
      // Clear file input
      const fileInput = document.getElementById('layout-file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('❌ Error uploading layout:', err);
      setError(err.response?.data?.message || 'Failed to upload layout');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDeleteLayout = async () => {
    if (!unit.layoutImage) return;
    
    if (!window.confirm('Are you sure you want to delete the layout image?')) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      console.log('🗑️ Deleting layout for unit:', unit._id);
      
      // Use the new Cloudinary API endpoint
      await unitAPI.deleteLayout(unit._id);
      
      setSuccess('Layout deleted successfully from Cloudinary!');
      
      // Call the callback to refresh unit data
      if (onLayoutUpdated) {
        onLayoutUpdated();
      }
      
    } catch (err) {
      console.error('❌ Error deleting layout:', err);
      setError(err.response?.data?.message || 'Failed to delete layout');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Unit Layout</h3>
      
      {/* Error/Success Messages */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {/* Current Layout Display */}
      {unit.layoutImage && (
        <div style={{ marginBottom: '2rem' }}>
          <h4>Current Layout</h4>
          <div style={{ 
            position: 'relative',
            display: 'inline-block',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <img 
              src={unit.layoutImage} 
              alt={`Unit ${unit.unitNumber} Layout`}
              style={{ 
                maxWidth: '100%',
                maxHeight: '400px',
                display: 'block'
              }}
              onError={(e) => {
                console.error('❌ Layout image failed to load:', unit.layoutImage);
                setError('Layout image failed to load');
              }}
              onLoad={() => {
                console.log('✅ Layout image loaded successfully:', unit.layoutImage);
              }}
            />
            <button
              onClick={handleDeleteLayout}
              disabled={uploading}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                opacity: uploading ? 0.5 : 1
              }}
              title="Delete layout"
            >
              ×
            </button>
          </div>
          
          {/* Show storage type info */}
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#6c757d',
            marginBottom: '1rem'
          }}>
            {unit.layoutImage.includes('cloudinary.com') ? (
              <span style={{ color: '#28a745' }}>
                ☁️ Stored on Cloudinary (Persistent & Optimized)
              </span>
            ) : (
              <span style={{ color: '#ffc107' }}>
                💾 Legacy local storage (May disappear on restart)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div>
        <h4>{unit.layoutImage ? 'Update Layout' : 'Upload Layout'}</h4>
        
        {/* Drag and Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('layout-file-input').click()}
          style={{
            border: `2px dashed ${dragOver ? '#007bff' : '#dee2e6'}`,
            borderRadius: '8px',
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: dragOver ? '#f8f9fa' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '1rem'
          }}
        >
          {uploading ? (
            <div>
              <div style={{
                margin: '0 auto 1rem',
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Uploading to Cloudinary...
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                fontSize: '3rem', 
                color: '#6c757d', 
                marginBottom: '1rem' 
              }}>
                📐
              </div>
              <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>
                {dragOver ? 'Drop layout image here' : 'Drop layout image here or click to browse'}
              </h4>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
                Supports JPEG, PNG, GIF (max 10MB) • Will be stored on Cloudinary
              </p>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          id="layout-file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />

        {/* Help Text */}
        <div style={{ 
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '0.9rem',
          color: '#6c757d'
        }}>
          <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
            ☁️ Cloudinary Storage Benefits:
          </h5>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>✅ <strong>Permanent storage</strong> - Images never disappear</li>
            <li>✅ <strong>Global CDN</strong> - Fast loading worldwide</li>
            <li>✅ <strong>Automatic optimization</strong> - WebP format, compression</li>
            <li>📏 Recommended: Floor plans at least 800x600 pixels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LayoutUploader;