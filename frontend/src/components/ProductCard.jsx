import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaHeart, FaStar, FaShoppingCart } from 'react-icons/fa';
import { useState } from 'react';

const ProductCard = ({ product }) => {
    const { user, wishlist, toggleWishlist } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const isWishlisted = wishlist.some(item => item._id === product._id);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        toggleWishlist(product._id);
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        setAdding(true);
        try {
            await addToCart(product._id, 1, product.sizes?.[0] || '');
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch {
            // silently fail — user can go to product detail
        } finally {
            setAdding(false);
        }
    };

    // Placeholder SVG as a data URI for when no image is available
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%2316162a'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial' font-size='50' fill='%23333355' text-anchor='middle'%3E👟%3C/text%3E%3Ctext x='50%25' y='65%25' font-family='Arial' font-size='14' fill='%23555577' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

    const getImageSrc = (img) => {
        if (!img || typeof img !== 'string' || img.trim() === '') {
            return placeholderImage;
        }
        if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
        }
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
        return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    };

    const rating = product.rating || 0;
    const numReviews = product.numReviews || 0;

    // Generate deterministic discount (e.g. 15%, 20%, 25%) based on product ID character code
    const discountPercent = ((product._id.toString().charCodeAt(10) || 0) % 3 + 3) * 5; // returns 15, 20, 25
    const originalPrice = Math.round(product.price / (1 - discountPercent / 100));

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-image-link">
                <div className="product-card-image">
                    {/* Glowing Discount Badge */}
                    {product.stock > 0 && (
                        <div className="product-discount-badge">
                            {discountPercent}% OFF
                        </div>
                    )}
                    <img
                        src={getImageSrc(product.images?.[0])}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                    />
                    <button
                        className={`wishlist-card-btn${isWishlisted ? ' active' : ''}`}
                        onClick={handleWishlistClick}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <FaHeart />
                    </button>
                    {product.stock === 0 && (
                        <div className="product-out-of-stock-badge">Out of Stock</div>
                    )}
                </div>
            </Link>
            <div className="product-card-info">
                <h3 className="product-card-name">{product.name}</h3>
                {numReviews > 0 && (
                    <div className="product-card-rating">
                        <FaStar className="star-icon" />
                        <span className="rating-value">{rating.toFixed(1)}</span>
                        <span className="rating-count">({numReviews})</span>
                    </div>
                )}
                <div className="product-card-price-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <div className="product-card-price" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: 0 }}>
                        <span className="price-value" style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '18px' }}>₹{product.price?.toLocaleString('en-IN')}</span>
                        {product.stock > 0 && (
                            <span className="original-price-value" style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '13px', fontWeight: '400' }}>₹{originalPrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                    <Link to={`/product/${product._id}`} className="view-link" style={{ alignSelf: 'flex-start', fontSize: '12px', fontWeight: '600' }}>View details</Link>
                </div>
                {product.stock > 0 && (
                    <button
                        className={`quick-add-btn${added ? ' quick-add-success' : ''}`}
                        onClick={handleQuickAdd}
                        disabled={adding}
                        aria-label="Add to cart"
                    >
                        <FaShoppingCart />
                        <span>{adding ? 'Adding...' : added ? 'Added!' : 'Quick Add'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
