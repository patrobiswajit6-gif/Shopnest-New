const express = require('express')
const { body } = require('express-validator')
const { register, login, getMe, sendOtp, loginWithOtp, resetPassword } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Validation rules
const registerRules = [
    body('name').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    body('phone')
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Enter a valid 10-digit phone number.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
]

const loginRules = [
    body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
]

// Routes
router.post('/register', registerRules, register)
router.post('/login', loginRules, login)
router.get('/me', protect, getMe)

router.post('/send-otp', sendOtp)
router.post('/login-otp', loginWithOtp)
router.post('/reset-password', resetPassword)

module.exports = router
