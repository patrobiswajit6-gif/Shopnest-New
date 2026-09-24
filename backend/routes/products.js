const express = require('express')
const {
    getAllProducts,
    searchProducts,
    getCategories,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// Public routes (still require authentication via protect)
router.get('/', protect, getAllProducts)
router.get('/search', protect, searchProducts)
router.get('/categories', protect, getCategories)
router.get('/category/:slug', protect, getProductsByCategory)
router.get('/:id', protect, getProductById)

// Admin-only routes
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

module.exports = router
