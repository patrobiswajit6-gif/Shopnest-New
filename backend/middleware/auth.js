const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Verify JWT from Authorization header.
 * Attaches req.user (safe user object) on success.
 */
async function protect(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorised — no token provided.' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists.' })
        }
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' })
    }
}

/**
 * Restrict access to admin role only.
 * Must be used AFTER protect middleware.
 */
function adminOnly(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next()
    }
    res.status(403).json({ message: 'Access denied — admin only.' })
}

module.exports = { protect, adminOnly }
