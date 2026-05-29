import { useState, useEffect } from 'react';
import API from '../api/axios';
import { FaUser, FaEnvelope, FaCommentAlt, FaPaperPlane, FaStar, FaRegStar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Sentiment Lexicon matching backend for client-side evaluation
const POSITIVE_WORDS = [
    'good', 'great', 'love', 'nice', 'awesome', 'best', 'excellent', 'amazing', 
    'perfect', 'happy', 'satisfied', 'fast', 'smooth', 'comfortable', 'quality', 
    'super', 'cool', 'recommend', 'glad', 'wonderful', 'fantastic', 'outstanding',
    'helpful', 'friendly', 'thanks', 'thank', 'perfectly', 'efficient'
];

const NEGATIVE_WORDS = [
    'bad', 'worst', 'poor', 'hate', 'terrible', 'horrible', 'waste', 'broken', 
    'slow', 'late', 'expensive', 'uncomfortable', 'refund', 'cheap', 'unhappy', 
    'disappointed', 'disappointing', 'defect', 'defective', 'damage', 'damaged', 
    'useless', 'wrong', 'rude', 'fail', 'failed', 'failure', 'dislike',
    'awful', 'pain', 'shitty'
];

const analyzeSentiment = (text) => {
    if (!text || text.trim() === '') return { sentiment: 'neutral', score: 0 };
    
    const words = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
        .split(/\s+/);

    let score = 0;
    words.forEach(word => {
        if (POSITIVE_WORDS.includes(word)) score += 1;
        if (NEGATIVE_WORDS.includes(word)) score -= 1;
    });

    let sentiment = 'neutral';
    if (score > 0) sentiment = 'positive';
    else if (score < 0) sentiment = 'negative';

    return { sentiment, score };
};

const FEEDBACK_CATEGORIES = [
    { id: 'usability', label: '💻 Website Usability' },
    { id: 'quality', label: '👟 Product Quality' },
    { id: 'delivery', label: '🚚 Shipping & Delivery' },
    { id: 'experience', label: '🛒 Shopping Experience' },
    { id: 'support', label: '📞 Customer Support' }
];

const Feedback = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('usability');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    
    // Live Sentiment state
    const [sentimentData, setSentimentData] = useState({ sentiment: 'neutral', score: 0 });

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Update sentiment on message change
    useEffect(() => {
        setSentimentData(analyzeSentiment(message));
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setLoading(true);

        const categoryLabel = FEEDBACK_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'General';
        
        // Append Category & Rating details to message so they are saved in Mongoose's message field
        const formattedMessage = `[Feedback Category: ${categoryLabel}] [Rating: ${rating}/5 Stars]\n\n${message}`;

        try {
            await API.post('/feedback', {
                name,
                email,
                message: formattedMessage
            });
            
            setSuccess('Thank you! Your valuable feedback has been submitted successfully.');
            setName('');
            setEmail('');
            setMessage('');
            setRating(5);
            setSelectedCategory('usability');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper for Sentiment display
    const getSentimentDetails = () => {
        switch (sentimentData.sentiment) {
            case 'positive':
                return {
                    class: 'sentiment-positive',
                    emoji: '😊',
                    title: 'Positive Sentiment Detected',
                    desc: "Awesome! Your words show we're doing great. Thanks for the support! ✨"
                };
            case 'negative':
                return {
                    class: 'sentiment-negative',
                    emoji: '😢',
                    title: 'Negative Sentiment Detected',
                    desc: "Oh no! We're sorry you had a bad experience. We're fully on it to improve! 🛠️"
                };
            default:
                return {
                    class: 'sentiment-neutral',
                    emoji: '🤔',
                    title: 'Neutral Sentiment',
                    desc: 'Tell us more! Your honest feedback helps us evolve the shopping experience.'
                };
        }
    };

    const sentiment = getSentimentDetails();

    return (
        <div className="pro-page pro-page-narrow">
            {/* Page Header */}
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaCommentAlt className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Share Your Feedback</h1>
                        <p className="pro-page-subtitle">Help SoleStreet Patna serve you better every day</p>
                    </div>
                </div>
            </div>

            <div className="feedback-container">
                {/* Visual info and Live Sentiment Card */}
                <div className="feedback-sidebar-info">
                    <div className="feedback-intro-card">
                        <h3>Your Voice Makes Us Better</h3>
                        <p>SoleStreet Patna is a local store built on trust and quality. Every word of feedback you share helps us serve you — and all of Patna — even better. Tell us what you love, what we can improve, or suggest new brands!</p>
                    </div>

                    {/* Real-time Sentiment Analyzer Widget */}
                    <div className={`sentiment-widget-card ${sentiment.class}`}>
                        <div className="sentiment-widget-glow" />
                        <div className="sentiment-header">
                            <span className="sentiment-emoji">{sentiment.emoji}</span>
                            <div>
                                <h4 className="sentiment-title">{sentiment.title}</h4>
                                <span className="sentiment-score-badge">Lexicon Score: {sentimentData.score}</span>
                            </div>
                        </div>
                        <p className="sentiment-desc">{sentiment.desc}</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="form-card feedback-form-card">
                    {success && (
                        <div className="success-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCheckCircle /> {success}
                        </div>
                    )}
                    {error && (
                        <div className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="checkout-form feedback-form">
                        
                        {/* Interactive Star Rating */}
                        <div className="form-group">
                            <label>Rate Your Experience</label>
                            <div className="interactive-stars-row">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="star-trigger-btn"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        aria-label={`Rate ${star} Stars`}
                                    >
                                        {star <= (hoverRating || rating) ? (
                                            <FaStar className="interactive-star-icon filled" />
                                        ) : (
                                            <FaRegStar className="interactive-star-icon empty" />
                                        )}
                                    </button>
                                ))}
                                <span className="rating-label-description">
                                    {rating === 5 && '😍 Excellent'}
                                    {rating === 4 && '😊 Very Good'}
                                    {rating === 3 && '😐 Average'}
                                    {rating === 2 && '🙁 Poor'}
                                    {rating === 1 && '😡 Very Bad'}
                                </span>
                            </div>
                        </div>

                        {/* Interactive Category Select Pills */}
                        <div className="form-group">
                            <label>Feedback Category</label>
                            <div className="feedback-category-pills">
                                {FEEDBACK_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`category-pill-btn${selectedCategory === cat.id ? ' active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name and Email Inputs */}
                        <div className="form-row-2col">
                            <div className="form-group">
                                <label><FaUser className="form-input-label-icon" /> Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><FaEnvelope className="form-input-label-icon" /> Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="form-group">
                            <div className="form-label-row-between">
                                <label><FaCommentAlt className="form-input-label-icon" /> Detailed Message</label>
                                <span className="char-count-info">{message.length} chars</span>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="5"
                                placeholder="Type your honest message here... try typing words like 'love', 'amazing', 'slow', or 'bad' to see the real-time sentiment analysis change!"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn-checkout feedback-submit-btn" disabled={loading}>
                            {loading ? (
                                'Submitting Feedback...'
                            ) : (
                                <>
                                    <FaPaperPlane style={{ fontSize: '12px' }} /> Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
