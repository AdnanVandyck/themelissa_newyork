const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Storage configuration for unit images
const unitImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'melissa-apartments/units', // Organize images in folders
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { 
        width: 1200, 
        height: 800, 
        crop: 'limit', // Don't upscale, just limit max size
        quality: 'auto', // Automatic quality optimization
        fetch_format: 'auto' // Automatic format optimization (WebP when supported)
      }
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.round(Math.random() * 1E9)
      return `unit-${req.params.id}-${timestamp}-${random}`
    }
  }
})

// Storage configuration for layout images
const layoutImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'melissa-apartments/layouts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { 
        width: 1000, 
        height: 800, 
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now()
      return `layout-${req.params.id}-${timestamp}`
    }
  }
})

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping()
    console.log('✅ Cloudinary connection successful:', result)
    return true
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message)
    return false
  }
}

module.exports = {
  cloudinary,
  unitImageStorage,
  layoutImageStorage,
  testCloudinaryConnection
}