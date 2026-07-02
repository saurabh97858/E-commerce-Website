const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Order', 'Refund', 'Delivery', 'Quality', 'Other'], default: 'Other' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
