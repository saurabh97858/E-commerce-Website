import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaTrashAlt, FaMinus, FaPlus, FaArrowRight, FaShoppingBag } from 'react-icons/fa';

const Cart = () => {
    const { cart, updateCartItem, removeFromCart } = useCart();
    const navigate = useNavigate();

    const total = cart.items
        ? cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
        : 0;

    const itemCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="empty-state-page">
                <div className="empty-state-card">
                    <div className="empty-state-icon">
                        <FaShoppingCart />
                    </div>
                    <h2 className="empty-state-title">Your Cart is Empty</h2>
                    <p className="empty-state-text">Looks like you haven't added any shoes yet. Explore our collection and find your perfect pair!</p>
                    <Link to="/" className="btn-primary-lg">
                        <FaShoppingBag /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaShoppingCart className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Shopping Cart</h1>
                        <p className="pro-page-subtitle">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
                    </div>
                </div>
            </div>

            <div className="cart-layout">
                <div className="cart-items-section">
                    {cart.items.map((item) => (
                        <div className="cart-item-card" key={item._id}>
                            <div className="cart-item-image-wrapper">
                                <img
                                    src={
                                        (() => {
                                            const img = item.product?.images?.[0];
                                            if (!img || typeof img !== 'string' || img.trim() === '') return '/placeholder.png';
                                            if (img.startsWith('http') || img.startsWith('data:')) return img;
                                            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                            return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
                                        })()
                                    }
                                    alt={item.product?.name}
                                    className="cart-item-image"
                                />
                            </div>
                            <div className="cart-item-details">
                                <h3 className="cart-item-name">{item.product?.name}</h3>
                                {item.size && <span className="cart-item-size">Size: UK {item.size}</span>}
                                <span className="cart-item-price">₹{item.product?.price}</span>
                            </div>
                            <div className="cart-item-qty">
                                <button 
                                    className="qty-btn" 
                                    onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                                    disabled={item.quantity <= 1}
                                >
                                    <FaMinus />
                                </button>
                                <span className="qty-value">{item.quantity}</span>
                                <button 
                                    className="qty-btn" 
                                    onClick={() => updateCartItem(item._id, item.quantity + 1)}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                            <div className="cart-item-total">
                                ₹{(item.product?.price || 0) * item.quantity}
                            </div>
                            <button className="cart-item-remove" onClick={() => removeFromCart(item._id)} title="Remove item">
                                <FaTrashAlt />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary-card">
                    <h3 className="cart-summary-title">Order Summary</h3>
                    <div className="cart-summary-row">
                        <span>Subtotal ({itemCount} items)</span>
                        <span>₹{total}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span className="text-success">{total >= 1000 ? 'FREE' : '₹99'}</span>
                    </div>
                    <div className="cart-summary-divider"></div>
                    <div className="cart-summary-row cart-summary-total">
                        <span>Total</span>
                        <span>₹{total >= 1000 ? total : total + 99}</span>
                    </div>
                    {total < 1000 && (
                        <p className="cart-free-shipping-hint">Add ₹{1000 - total} more for free shipping!</p>
                    )}
                    <button onClick={() => navigate('/checkout')} className="btn-checkout">
                        Proceed to Checkout <FaArrowRight />
                    </button>
                    <Link to="/" className="cart-continue-link">← Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
