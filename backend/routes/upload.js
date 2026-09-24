const express = require('express')
const multer = require('multer')
const { uploadImage } = require('../controllers/uploadController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Store file in memory (buffer) so ImageKit can receive it directly
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed.'))
        }
        cb(null, true)
    }
})

// POST /api/upload — protected, accepts field "image"
router.post('/', protect, upload.single('image'), uploadImage)

// Handle multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ message: err.message })
    }
    next(err)
})

module.exports = router
