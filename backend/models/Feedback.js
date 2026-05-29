const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    sentimentScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
