import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaChevronLeft } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Reviews state
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const { addToCart } = useCart();
    const { user, wishlist, toggleWishlist } = useAuth();
    const navigate = useNavigate();

    const isWishlisted = wishlist.some(item => item._id === id);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setProduct(null);
            setSelectedImage(0);
            setSize('');
            const { data } = await API.get(`/products/${id}`);
            setProduct(data);
            if (data.sizes && data.sizes.length > 0) {
                setSize(data.sizes[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setAddingToCart(true);
        try {
            await addToCart(product._id, quantity, size);
            showMessage('Item added to cart!', 'success');
        } catch {
            showMessage('Failed to add to cart. Please try again.', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleWishlist = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        toggleWishlist(product._id);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError('');
        if (!reviewText.trim()) return;
        setSubmittingReview(true);
        try {
            const { data } = await API.post(`/products/${product._id}/reviews`, { rating, review: reviewText });
            setProduct(data.product);
            setReviewText('');
            setRating(5);
            showMessage('Review submitted successfully!', 'success');
        } catch (error) {
            setReviewError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Image zoom on mouse move
    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        const img = e.currentTarget.querySelector('img');
        if (img) {
            img.style.transformOrigin = `${x}% ${y}%`;
            img.style.transform = 'scale(1.8)';
        }
    };

    const handleMouseLeave = (e) => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
    };

    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%2316162a'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial' font-size='70' fill='%23333355' text-anchor='middle'%3E👟%3C/text%3E%3Ctext x='50%25' y='65%25' font-family='Arial' font-size='18' fill='%23555577' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

    const getImageSrc = (img) => {
        if (!img || typeof img !== 'string' || img.trim() === '') return placeholderImage;
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
        return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    };

    const renderStars = (num, interactive = false, onSelect = null) => {
        const stars = [];
        const floor = Math.floor(num);
        for (let i = 1; i <= 5; i++) {
            const filled = i <= floor || (i === floor + 1 && num % 1 >= 0.5);
            stars.push(
                <span
                    key={i}
                    className={`star${filled ? ' star-filled' : ' star-empty'}${interactive ? ' star-interactive' : ''}`}
                    onClick={interactive && onSelect ? () => onSelect(i) : undefined}
                    role={interactive ? 'button' : undefined}
                    aria-label={interactive ? `Rate ${i} star` : undefined}
                >
                    {filled ? <FaStar /> : <FaRegStar />}
                </span>
            );
        }
        return stars;
    };

    if (loading) return <div className="loading">Loading product...</div>;
    if (!product) return (
        <div className="no-products">
            <div className="no-products-icon">😕</div>
            <h3>Product not found</h3>
            <button className="btn-primary-sm" onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );

    return (
        <div className="product-detail-page">
            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
                <button className="breadcrumb-back" onClick={() => navigate(-1)}>
                    <FaChevronLeft /> Back
                </button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-category">{product.category?.name || 'Products'}</span>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{product.name}</span>
            </div>

            <div className="product-detail-container">
                {/* Images Section */}
                <div className="product-images">
                    <div
                        className="main-image"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img
                            src={getImageSrc(product.images?.[selectedImage])}
                            alt={product.name}
                            className="main-image-img"
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="thumbnail-list">
                            {product.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={getImageSrc(img)}
                                    alt={`${product.name} view ${idx + 1}`}
                                    className={`thumbnail${selectedImage === idx ? ' active' : ''}`}
                                    onClick={() => setSelectedImage(idx)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="product-info">
                    <div className="product-info-top">
                        <span className="product-category-badge">{product.category?.name || 'Shoes'}</span>
                        {product.stock > 0
                            ? <span className="stock-badge in-stock">In Stock ({product.stock} left)</span>
                            : <span className="stock-badge out-of-stock">Out of Stock</span>
                        }
                    </div>

                    <h1 className="product-title">{product.name}</h1>

                    {/* Rating */}
                    <div className="product-rating-row">
                        <div className="stars-display">
                            {renderStars(product.rating || 0)}
                        </div>
                        <span className="rating-text">
                            {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.numReviews || 0} reviews)
                        </span>
                    </div>

                    <div className="product-price">₹{product.price?.toLocaleString('en-IN')}</div>

                    {product.description && (
                        <p className="product-description">{product.description}</p>
                    )}

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="product-size-selector">
                            <label className="size-label">Select Size (UK)</label>
                            <div className="size-options">
                                {product.sizes.map((s) => (
                                    <button
                                        key={s}
                                        className={`size-btn${size === s ? ' active' : ''}`}
                                        onClick={() => setSize(s)}
                                        type="button"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="product-quantity-row">
                        <label className="qty-label">Quantity</label>
                        <div className="qty-controls">
                            <button
                                className="qty-ctrl-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                type="button"
                            >−</button>
                            <span className="qty-display">{quantity}</span>
                            <button
                                className="qty-ctrl-btn"
                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                disabled={quantity >= product.stock}
                                type="button"
                            >+</button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="product-actions">
                        <button
                            onClick={handleAddToCart}
                            className="btn-add-to-cart"
                            disabled={product.stock === 0 || addingToCart}
                        >
                            <FaShoppingCart />
                            {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={handleWishlist}
                            className={`btn-wishlist${isWishlisted ? ' wishlisted' : ''}`}
                            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                            <FaHeart />
                        </button>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`detail-message ${message.type}`}>{message.text}</div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
                <h2 className="reviews-section-title">
                    Customer Reviews
                    <span className="reviews-count">({product.numReviews || 0})</span>
                </h2>

                <div className="reviews-layout">
                    {/* Reviews List */}
                    <div className="reviews-list">
                        {(!product.ratings || product.ratings.length === 0) ? (
                            <div className="no-reviews">
                                <p>No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            product.ratings.map((rev) => (
                                <div key={rev._id} className="review-card">
                                    <div className="review-card-header">
                                        <div className="review-avatar">
                                            {rev.userName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="review-meta">
                                            <strong className="reviewer-name">{rev.userName}</strong>
                                            <span className="review-date">
                                                {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="review-stars">
                                        {renderStars(rev.rating)}
                                    </div>
                                    <p className="review-text">{rev.review}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Write Review Form */}
                    <div className="write-review-card">
                        <h3 className="write-review-title">Write a Review</h3>
                        {!user ? (
                            <p className="review-login-prompt">
                                Please{' '}
                                <span className="review-login-link" onClick={() => navigate('/login')}>
                                    sign in
                                </span>{' '}
                                to share your review.
                            </p>
                        ) : (
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <div className="form-group">
                                    <label>Your Rating</label>
                                    <div className="interactive-stars">
                                        {renderStars(rating, true, setRating)}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Your Review</label>
                                    <textarea
                                        rows="4"
                                        placeholder="What did you think of this product?"
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                        className="review-textarea"
                                    />
                                </div>
                                {reviewError && <div className="error-msg">{reviewError}</div>}
                                <button
                                    type="submit"
                                    className="btn-submit-review"
                                    disabled={submittingReview}
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
