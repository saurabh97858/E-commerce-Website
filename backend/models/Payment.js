const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentType: { type: String, required: true },
    bankName: { type: String, required: true },
    branch: { type: String, default: '' },
    cardNumberLast4: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
