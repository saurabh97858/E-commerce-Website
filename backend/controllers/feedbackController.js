const Feedback = require('../models/Feedback');

// Sentiment Analysis algorithm using simple lexicon approach
const analyzeSentiment = (text) => {
    if (!text) return { sentiment: 'neutral', score: 0 };
    
    const positiveWords = [
        'good', 'great', 'love', 'nice', 'awesome', 'best', 'excellent', 'amazing', 
        'perfect', 'happy', 'satisfied', 'fast', 'smooth', 'comfortable', 'quality', 
        'super', 'cool', 'recommend', 'glad', 'wonderful', 'fantastic', 'outstanding',
        'helpful', 'friendly', 'thanks', 'thank', 'perfectly', 'efficient'
    ];
    const negativeWords = [
        'bad', 'worst', 'poor', 'hate', 'terrible', 'horrible', 'waste', 'broken', 
        'slow', 'late', 'expensive', 'uncomfortable', 'refund', 'cheap', 'unhappy', 
        'disappointed', 'disappointing', 'defect', 'defective', 'damage', 'damaged', 
        'useless', 'wrong', 'rude', 'fail', 'failed', 'failure', 'dislike',
        'awful', 'pain', 'shitty'
    ];

    // Clean text and split into words
    const words = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
        .split(/\s+/);

    let score = 0;
    words.forEach(word => {
        if (positiveWords.includes(word)) score += 1;
        if (negativeWords.includes(word)) score -= 1;
    });

    let sentiment = 'neutral';
    if (score > 0) sentiment = 'positive';
    else if (score < 0) sentiment = 'negative';

    return { sentiment, score };
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const { sentiment, score } = analyzeSentiment(message);
        
        const feedback = await Feedback.create({ 
            name, 
            email, 
            message,
            sentiment,
            sentimentScore: score
        });
        
        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all feedback (admin)
exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        
        // Resolve missing sentiments on the fly for older database records
        const resolvedFeedbacks = [];
        for (let f of feedbacks) {
            // Convert Mongoose document to plain object so we can modify it
            const fObj = f.toObject();
            if (!fObj.sentiment) {
                const { sentiment, score } = analyzeSentiment(fObj.message);
                fObj.sentiment = sentiment;
                fObj.sentimentScore = score;
                // Asynchronously save back to DB to retrofit this old record
                await Feedback.updateOne({ _id: f._id }, { $set: { sentiment, sentimentScore: score } });
            }
            resolvedFeedbacks.push(fObj);
        }
        
        res.json(resolvedFeedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
