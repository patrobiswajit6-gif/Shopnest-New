require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const uploadRoutes = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 5000

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        credentials: true
    })
)

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/upload', uploadRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(err.status || 500).json({ message: err.message || 'Internal server error.' })
})

// ── Connect to MongoDB and start server ───────────────────────────────────────
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected:', process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`🚀 ShopNest backend running on http://localhost:${PORT}`)
            console.log(`   Health:   http://localhost:${PORT}/health`)
            console.log(`   Auth:     http://localhost:${PORT}/api/auth`)
            console.log(`   Products: http://localhost:${PORT}/api/products`)
            console.log(`   Upload:   http://localhost:${PORT}/api/upload`)
        })
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message)
        process.exit(1)
    })
