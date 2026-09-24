const Product = require('../models/Product')

/**
 * GET /api/products
 * Query params: limit, skip, category, search
 */
async function getAllProducts(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 30
        const skip = parseInt(req.query.skip) || 0
        const category = req.query.category
        const search = req.query.search

        const filter = {}
        if (category) filter.category = category.toLowerCase()
        if (search) filter.$text = { $search: search }

        const [products, total] = await Promise.all([
            Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Product.countDocuments(filter)
        ])

        res.json({ products, total, limit, skip })
    } catch (err) {
        console.error('getAllProducts error:', err)
        res.status(500).json({ message: 'Failed to fetch products.' })
    }
}

/**
 * GET /api/products/search?q=
 */
async function searchProducts(req, res) {
    try {
        const q = req.query.q || ''
        const limit = parseInt(req.query.limit) || 30
        const skip = parseInt(req.query.skip) || 0

        const filter = q ? { $text: { $search: q } } : {}
        const [products, total] = await Promise.all([
            Product.find(filter).skip(skip).limit(limit),
            Product.countDocuments(filter)
        ])

        res.json({ products, total, limit, skip })
    } catch (err) {
        console.error('searchProducts error:', err)
        res.status(500).json({ message: 'Failed to search products.' })
    }
}

/**
 * GET /api/products/categories
 */
async function getCategories(req, res) {
    try {
        const categories = await Product.distinct('category')
        // Frontend expects [{ slug: 'category_name', name: 'Category Name', url: '...' }]
        const formatted = categories.map(c => ({
            slug: c,
            name: c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')
        }))
        res.json(formatted)
    } catch (err) {
        console.error('getCategories error:', err)
        res.status(500).json({ message: 'Failed to fetch categories.' })
    }
}

/**
 * GET /api/products/category/:slug
 */
async function getProductsByCategory(req, res) {
    try {
        const slug = req.params.slug.toLowerCase()
        const limit = parseInt(req.query.limit) || 30
        const skip = parseInt(req.query.skip) || 0

        const [products, total] = await Promise.all([
            Product.find({ category: slug }).skip(skip).limit(limit),
            Product.countDocuments({ category: slug })
        ])

        res.json({ products, total, limit, skip })
    } catch (err) {
        console.error('getProductsByCategory error:', err)
        res.status(500).json({ message: 'Failed to fetch products by category.' })
    }
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: 'Product not found.' })
        res.json(product)
    } catch (err) {
        console.error('getProductById error:', err)
        res.status(500).json({ message: 'Failed to fetch product.' })
    }
}

/**
 * POST /api/products  (admin)
 * Expects thumbnail URL (already uploaded to ImageKit via /api/upload)
 */
async function createProduct(req, res) {
    try {
        const {
            title,
            description,
            price,
            discountPercentage,
            stock,
            brand,
            category,
            thumbnail,
            images,
            tags,
            thumbnailFileId
        } = req.body

        if (!title || !price || !category) {
            return res.status(422).json({ message: 'title, price, and category are required.' })
        }

        const product = await Product.create({
            title,
            description,
            price,
            discountPercentage,
            stock,
            brand,
            category,
            thumbnail,
            images: images || [],
            tags: tags || [],
            thumbnailFileId
        })

        res.status(201).json(product)
    } catch (err) {
        console.error('createProduct error:', err)
        res.status(500).json({ message: 'Failed to create product.' })
    }
}

/**
 * PUT /api/products/:id  (admin)
 */
async function updateProduct(req, res) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if (!product) return res.status(404).json({ message: 'Product not found.' })
        res.json(product)
    } catch (err) {
        console.error('updateProduct error:', err)
        res.status(500).json({ message: 'Failed to update product.' })
    }
}

/**
 * DELETE /api/products/:id  (admin)
 */
async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) return res.status(404).json({ message: 'Product not found.' })
        res.json({ message: 'Product deleted successfully.', id: product._id })
    } catch (err) {
        console.error('deleteProduct error:', err)
        res.status(500).json({ message: 'Failed to delete product.' })
    }
}

module.exports = {
    getAllProducts,
    searchProducts,
    getCategories,
    getProductsByCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
