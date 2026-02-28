const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    name: {
        type: String,
        required: [true, 'Package name is required'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    ram: {
        type: Number,
        required: [true, 'RAM is required']
    },
    storage: {
        type: Number,
        required: [true, 'Storage is required']
    },
    cpuPercentage: {
        type: Number,
        required: [true, 'CPU percentage is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true
    },
    fullDescription: {
        type: String,
        required: [true, 'Full description is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);
