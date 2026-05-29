import { useState } from 'react';
import API from '../api/axios';
import { FaEnvelope, FaUser, FaPaperPlane, FaPhoneAlt, FaMapMarkerAlt, FaQuestionCircle, FaChevronDown, FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaRegClock } from 'react-icons/fa';

const FAQ_ITEMS = [
    {
        id: 1,
        question: '📦 How long does delivery take?',
        answer: 'Standard shipping takes 3-5 business days across India. Express delivery options (24-48 hours) are available in tier-1 metro cities during checkout. Once shipped, you will receive a real-time tracking link.'
    },
    {
        id: 2,
        question: '👟 What is the return and exchange policy?',
        answer: 'We offer a hassle-free, 10-day return and exchange window on all unworn shoes in their original box. Simply log in to your account, go to My Orders, and click on Return/Exchange to request a free pickup.'
    },
    {
        id: 3,
        question: '💳 Are my payment details secure?',
        answer: 'Absolutely. We use 256-bit SSL encrypted channels for all checkouts. We process payments using India\'s leading secure gateways, meaning your credit/debit card or UPI details are never stored on our servers.'
    },
    {
        id: 4,
        question: '🛡️ Do the shoes come with a warranty?',
        answer: 'Yes! All premium athletic and formal footwear purchases come with a 3-month brand warranty covering manufacturing and stitching defects. Contact our support team with your order ID to claim.'
    }
];

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    
    // Accordion state
    const [activeFaq, setActiveFaq] = useState(null);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleFaq = (id) => {
        setActiveFaq(prev => (prev === id ? null : id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setLoading(true);

        // Format the message with the selected subject so it's clearly categorized in the admin panel
        const formattedMessage = `[Contact Subject: ${formData.subject}]\n\n${formData.message}`;

        try {
            await API.post('/feedback', {
                name: formData.name,
                email: formData.email,
                message: formattedMessage
            });
            setSuccess('Thank you! Your inquiry has been received. Our support team will contact you shortly.');
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pro-page">
            {/* Page Header */}
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaEnvelope className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Contact SoleStreet Patna</h1>
                        <p className="pro-page-subtitle">We're right here in Patna — reach out anytime!</p>
                    </div>
                </div>
            </div>

            {/* Core Layout Grid */}
            <div className="contact-grid">
                
                {/* Left Side: Contact Information & Socials */}
                <div className="contact-left-column">
                    
                    {/* Information Card */}
                    <div className="contact-info-card">
                        <h3 className="contact-info-title">Visit Us or Write to Us</h3>
                        <p className="contact-info-text">Have a question about sizing, delivery, or returns? Our local Patna team is available 7 days a week to help you find the perfect pair.</p>
                        
                        <div className="contact-info-items">
                            <div className="contact-info-item">
                                <FaEnvelope className="contact-info-icon" />
                                <div>
                                    <span className="contact-info-label">Customer Support Email</span>
                                    <span className="contact-info-value">support@solestreetpatna.com</span>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <FaPhoneAlt className="contact-info-icon" />
                                <div>
                                    <span className="contact-info-label">Store Phone / WhatsApp</span>
                                    <span className="contact-info-value">+91-98765-43210 (Mon-Sun, 10AM-8PM)</span>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <FaMapMarkerAlt className="contact-info-icon" />
                                <div>
                                    <span className="contact-info-label">Store Address</span>
                                    <span className="contact-info-value">SoleStreet Patna, Shop No. 12, Maurya Lok Complex, Dak Bungalow Road, Patna, Bihar — 800001</span>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <FaRegClock className="contact-info-icon" />
                                <div>
                                    <span className="contact-info-label">Average Response Rate</span>
                                    <span className="contact-info-value">Within 2 to 4 hours</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Badges */}
                        <div className="contact-social-section">
                            <span className="contact-info-label" style={{ marginBottom: '10px' }}>Join the community</span>
                            <div className="social-icon-badges">
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-badge linkedin" title="LinkedIn">
                                    <FaLinkedin />
                                </a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-badge github" title="GitHub">
                                    <FaGithub />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-badge twitter" title="Twitter">
                                    <FaTwitter />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-badge instagram" title="Instagram">
                                    <FaInstagram />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Accordion widget */}
                    <div className="faq-accordion-card">
                        <div className="faq-card-header">
                            <FaQuestionCircle className="faq-header-icon" />
                            <h3>Frequently Asked Questions</h3>
                        </div>
                        <div className="faq-items-list">
                            {FAQ_ITEMS.map((faq) => {
                                const isOpen = activeFaq === faq.id;
                                return (
                                    <div key={faq.id} className={`faq-accordion-item${isOpen ? ' open' : ''}`}>
                                        <button
                                            type="button"
                                            className="faq-question-btn"
                                            onClick={() => toggleFaq(faq.id)}
                                            aria-expanded={isOpen}
                                        >
                                            <span>{faq.question}</span>
                                            <FaChevronDown className="faq-chevron" />
                                        </button>
                                        <div className="faq-answer-wrapper">
                                            <p className="faq-answer-content">{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="form-card contact-form-card">
                    <h3 className="form-card-title">Send Us a Direct Message</h3>
                    <p className="form-card-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Fill in your details below and our support specialists will review and contact you with a customized resolution.
                    </p>
                    
                    {success && <div className="success-msg">{success}</div>}
                    {error && <div className="error-msg">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="checkout-form contact-form">
                        
                        {/* Name Input */}
                        <div className="form-group">
                            <label><FaUser className="form-input-label-icon" /> Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div className="form-group">
                            <label><FaEnvelope className="form-input-label-icon" /> Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                required
                            />
                        </div>

                        {/* Subject Select */}
                        <div className="form-group">
                            <label>Inquiry Subject</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="checkout-country-select"
                                required
                            >
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Order & Delivery Support">Order &amp; Delivery Support</option>
                                <option value="Return or Refund Request">Return or Refund Request</option>
                                <option value="Product Sizing & Inventory">Product Sizing &amp; Inventory</option>
                                <option value="Partnership & Sponsorship">Partnership &amp; Sponsorship Proposal</option>
                            </select>
                        </div>

                        {/* Message Input */}
                        <div className="form-group">
                            <label><FaEnvelope className="form-input-label-icon" /> How can we help you?</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Tell us what you need support with in detail..."
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn-checkout contact-submit-btn" disabled={loading}>
                            {loading ? (
                                'Sending Message...'
                            ) : (
                                <>
                                    <FaPaperPlane style={{ fontSize: '11px' }} /> Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
