const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        stock: { type: Number, default: 0, min: 0 },
        brand: { type: String, default: '', trim: true },
        category: { type: String, required: true, trim: true, lowercase: true },
        // Primary thumbnail — stored as ImageKit CDN URL
        thumbnail: { type: String, default: '' },
        // Additional images — each is an ImageKit CDN URL
        images: [{ type: String }],
        tags: [{ type: String }],
        // ImageKit fileId for the thumbnail (used for deletion)
        thumbnailFileId: { type: String, default: '' }
    },
    { timestamps: true }
)

// Ensure virtual 'id' is included when converting to JSON
productSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
})

// Full-text index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text', category: 'text' })

module.exports = mongoose.model('Product', productSchema)
