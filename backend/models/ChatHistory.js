const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orders: { type: Array, default: [] }, // Persist recent order details for UI rendering
    action: { type: String, default: null }, // e.g. "cancel_order", "create_ticket", "change_address", "human_handoff"
    ticketId: { type: String, default: null }, // If a ticket was created in this turn
    timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, unique: true, sparse: true }, // For guest users
    messages: [chatMessageSchema],
    handoff: { type: Boolean, default: false },
    state: { type: String, default: null }, // e.g. "AWAITING_CANCEL_REASON", "AWAITING_CANCEL_METHOD"
    tempData: { type: mongoose.Schema.Types.Mixed, default: {} } // Temporary storage
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
