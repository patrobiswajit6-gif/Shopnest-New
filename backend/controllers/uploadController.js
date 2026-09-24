const ImageKit = require('imagekit')

// Initialise ImageKit client once
let imagekitClient = null
function getImageKit() {
    if (!imagekitClient) {
        imagekitClient = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        })
    }
    return imagekitClient
}

/**
 * POST /api/upload
 * Accepts a single image via multer (field: "image").
 * Uploads the buffer to ImageKit and returns the CDN URL + fileId.
 */
async function uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided. Use field name "image".' })
        }

        const ik = getImageKit()
        const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`

        const result = await ik.upload({
            file: req.file.buffer,           // Buffer from multer memory storage
            fileName,
            folder: '/shopnest/products',    // ImageKit folder path
            useUniqueFileName: true
        })

        res.json({
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            width: result.width,
            height: result.height
        })
    } catch (err) {
        console.error('uploadImage error:', err)
        res.status(500).json({ message: 'Failed to upload image to ImageKit.', detail: err.message })
    }
}

module.exports = { uploadImage }
