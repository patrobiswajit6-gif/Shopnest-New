const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema(
    {
        label: { type: String, default: 'Home' },
        line1: { type: String, required: true },
        line2: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    { _id: true }
)

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: { type: String, required: true, trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        addresses: [addressSchema],
        otp: { type: String, select: false },
        otpExpires: { type: Date, select: false }
    },
    { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// Compare plain password with hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

// Return safe user without password
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject()
    delete obj.password
    return obj
}

module.exports = mongoose.model('User', userSchema)
