import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube, FaHeart } from 'react-icons/fa';

const Footer = () => {
    const year = new Date().getFullYear();

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

                    {/* Newsletter */}
                    <div className="footer-newsletter">
                        <h4>Stay in the Loop</h4>
                        <p>Get exclusive deals and new arrivals in your inbox.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="newsletter-input"
                                aria-label="Email for newsletter"
                            />
                            <button type="submit" className="newsletter-btn">Subscribe</button>
                        </form>
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
