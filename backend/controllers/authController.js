const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Helpers ─────────────────────────────────────────────────────────────────

function signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })
}

function sendAuthResponse(res, statusCode, user, token) {
    res.status(statusCode).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            addresses: user.addresses,
            createdAt: user.createdAt
        }
    })
}

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
async function register(req, res) {
    // Validation errors from express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: errors.array()[0].msg, errors: errors.array() })
    }

    const { name, email, phone, password } = req.body

    try {
        // Check duplicate email
        const existing = await User.findOne({ email: email.trim().toLowerCase() })
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists.' })
        }

        // Count users — first user becomes admin, or use role from body directly (for dev)
        const userCount = await User.countDocuments()
        const role = req.body.role || (userCount === 0 ? 'admin' : 'user')

        const user = await User.create({ name, email, phone, password, role })
        const token = signToken(user._id)
        sendAuthResponse(res, 201, user, token)
    } catch (err) {
        console.error('register error:', err)
        res.status(500).json({ message: 'Server error during registration.' })
    }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: errors.array()[0].msg, errors: errors.array() })
    }

    const { email, password } = req.body

    try {
        // Must explicitly select password (field is select:false on schema)
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' })
        }

        const token = signToken(user._id)
        sendAuthResponse(res, 200, user, token)
    } catch (err) {
        console.error('login error:', err)
        res.status(500).json({ message: 'Server error during login.' })
    }
}

/**
 * GET /api/auth/me  (protected)
 */
async function getMe(req, res) {
    // req.user is populated by protect middleware
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
            addresses: req.user.addresses,
            createdAt: req.user.createdAt
        }
    })
}

// ── OTP Authentication ───────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * Body: { email }
 */
async function sendOtp(req, res) {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required.' })

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() })
        if (!user) return res.status(404).json({ message: 'No account found with this email.' })

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

        user.otp = otp
        user.otpExpires = otpExpires
        await user.save({ validateBeforeSave: false })

        const { sendEmail } = require('../utils/email')
        await sendEmail({
            to: user.email,
            subject: 'ShopNest Log In / Reset Password OTP',
            text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
            html: `<h3>Your ShopNest Verification Code</h3><p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`
        })

        res.json({ message: 'OTP sent to email.' })
    } catch (err) {
        console.error('sendOtp error:', err)
        res.status(500).json({ message: 'Failed to send OTP.' })
    }
}

/**
 * POST /api/auth/login-otp
 * Body: { email, otp }
 */
async function loginWithOtp(req, res) {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' })

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+otp +otpExpires')
        if (!user) return res.status(401).json({ message: 'Invalid email or OTP.' })

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' })
        }

        // Clear OTP
        user.otp = undefined
        user.otpExpires = undefined
        await user.save({ validateBeforeSave: false })

        const token = signToken(user._id)
        sendAuthResponse(res, 200, user, token)
    } catch (err) {
        console.error('loginWithOtp error:', err)
        res.status(500).json({ message: 'Server error during OTP login.' })
    }
}

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 */
async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'Email, OTP, and new password are required.' })
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+otp +otpExpires')
        if (!user) return res.status(401).json({ message: 'Invalid request.' })

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' })
        }

        // Update password & clear OTP
        user.password = newPassword
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()

        res.json({ message: 'Password updated successfully. You can now log in.' })
    } catch (err) {
        console.error('resetPassword error:', err)
        res.status(500).json({ message: 'Server error during password reset.' })
    }
}

module.exports = { register, login, getMe, sendOtp, loginWithOtp, resetPassword }
