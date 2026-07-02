import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube, FaHeart, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import API from '../api/axios';

const Footer = () => {
    const year = new Date().getFullYear();
    const { user } = useAuth();
    const [msg, setMsg] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        try {
            const finalName = user ? user.name : (name || 'Anonymous');
            const finalEmail = user ? user.email : (email || 'anonymous@solestreet.com');
            await API.post('/feedback', {
                name: finalName,
                email: finalEmail,
                message: msg
            });
            setSuccess('Submitted!');
            setMsg('');
            setName('');
            setEmail('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Failed to submit footer feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-main">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">SOLESTREET PATNA</div>
                        <p className="footer-tagline">Bihar's premium sneaker and footwear destination. Experience authentic quality, curated global designs, and top-tier comfort right in the heart of Patna.</p>
                        <div className="footer-social">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                                <FaFacebookF />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="footer-section">
                        <h4>Shop</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/cart">Cart</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div className="footer-section">
                        <h4>Account</h4>
                        <ul>
                            <li><Link to="/login">Sign In</Link></li>
                            <li><Link to="/register">Register</Link></li>
                            <li><Link to="/my-orders">My Orders</Link></li>
                            <li><Link to="/my-account">My Profile</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/feedback">Feedback</Link></li>
                            <li><a href="mailto:support@solestreetpatna.com">Email Support</a></li>
                        </ul>
                    </div>

                    {/* Compact Feedback Form */}
                    <div className="footer-newsletter" style={{ maxWidth: '280px' }}>
                        <h4>Share Feedback</h4>
                        {success ? (
                            <p style={{ color: 'var(--success)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', margin: '10px 0' }}>
                                <FaCheckCircle /> {success}
                            </p>
                        ) : (
                            <form className="newsletter-form" onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {!user && (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{
                                                flex: 1,
                                                fontSize: '11px',
                                                padding: '6px 8px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                color: 'var(--text-primary)',
                                                height: '28px'
                                            }}
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{
                                                flex: 1,
                                                fontSize: '11px',
                                                padding: '6px 8px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                color: 'var(--text-primary)',
                                                height: '28px'
                                            }}
                                            required
                                        />
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input
                                        type="text"
                                        placeholder={user ? "Write your feedback..." : "Feedback..."}
                                        value={msg}
                                        onChange={(e) => setMsg(e.target.value)}
                                        style={{
                                            flex: 1,
                                            fontSize: '11px',
                                            padding: '6px 8px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '4px',
                                            color: 'var(--text-primary)',
                                            height: '30px'
                                        }}
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        className="newsletter-btn"
                                        style={{
                                            height: '30px',
                                            lineHeight: '30px',
                                            padding: '0 12px',
                                            fontSize: '11px'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? '...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {year} SoleStreet Patna. Bihar's Premier Sneaker Destination. All rights reserved.</p>
                    <p className="footer-made-with">Made with <FaHeart className="footer-heart" /> in India</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
