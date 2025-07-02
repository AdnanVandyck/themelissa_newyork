import React, { useState } from 'react';
import { unitAPI } from '../../services/api';

const ImageUploader = ({ unit, onImagesUpdated }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
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

  const allImages = [];
  if (unit?.imageURL) allImages.push(unit.imageURL);
  if (unit?.images) allImages.push(...unit.images);

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
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={image}
                  alt={`Unit image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
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
                    justifyContent: 'center'
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

        <div style={{ marginBottom: '1rem' }}>
          <input
            id="image-upload-input"
            type="file"
            multiple
            accept="image/*"
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