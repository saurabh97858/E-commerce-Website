const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, default: '' },
    image: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        address: String,
        city: String,
        pincode: String
    },
    status: { type: String, enum: ['Pending', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
    estimatedDelivery: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
