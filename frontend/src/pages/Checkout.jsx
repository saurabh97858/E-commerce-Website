import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
    FaCreditCard, FaUniversity, FaLock, FaShieldAlt, FaArrowLeft,
    FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaMobileAlt, 
    FaEnvelope, FaCity, FaHashtag, FaWallet, FaTruck, FaGift, 
    FaRegCommentAlt, FaCheck
} from 'react-icons/fa';

/* ── Active Promo Codes ── */
const PROMO_CODES = {
    SOLESTREET: { discount: 0.15, label: '15% OFF Everything' },
    SHOE20:     { discount: 0.20, label: '20% OFF Footwear' },
    SNEAKER10:  { discount: 0.10, label: '10% OFF Sneakers' },
    BOOTS25:    { discount: 0.25, label: '25% OFF Leather Boots' },
    COMFY15:    { discount: 0.15, label: '15% OFF Sandals & Slippers' },
};

const Checkout = () => {
    const { cart, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /* Form Fields state */
    const [contact, setContact] = useState({
        firstName: '', lastName: '', email: '', mobile: ''
    });

    const [address, setAddress] = useState({
        address: '', city: '', state: '', pincode: '', landmark: ''
    });

    const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' or 'express'
    const [orderNotes, setOrderNotes] = useState('');

    const [payment, setPayment] = useState({
        paymentType: 'Credit Card', cardNumber: '', expiry: '', cvv: '', bankName: ''
    });

    /* Promo code state */
    const [promoInput, setPromoInput] = useState('');
    const [promoApplied, setPromoApplied] = useState(null);
    const [promoError, setPromoError] = useState('');

    /* Pre-fill fields from logged-in user profile */
    useEffect(() => {
        if (user) {
            const parts = (user.name || '').split(' ');
            setContact({
                firstName: parts[0] || '',
                lastName:  parts.slice(1).join(' ') || '',
                email:     user.email || '',
                mobile:    user.mobile || ''
            });
            setAddress(prev => ({
                ...prev,
                address: user.address || '',
                city:    user.city    || '',
                pincode: user.pincode || ''
            }));
        }
    }, [user]);

    // Price Calculations
    const subtotal = cart.items ? cart.items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0) : 0;
    
    // Shipping: Free standard above 1000, express is always ₹99
    const baseShipping = subtotal >= 1000 ? 0 : 99;
    const shipping = shippingMethod === 'express' ? 99 : baseShipping;
    
    // Promo Discount
    const discount = promoApplied ? Math.round(subtotal * promoApplied.discount) : 0;
    
    // COD charges
    const codCharges = payment.paymentType === 'Cash on Delivery' ? 25 : 0;
    
    // Grand Total
    const grandTotal = subtotal + shipping - discount + codCharges;

    /* Promo code logic */
    const applyPromo = () => {
        setPromoError('');
        const code = promoInput.trim().toUpperCase();
        if (PROMO_CODES[code]) {
            setPromoApplied({ code, ...PROMO_CODES[code] });
            setPromoError('');
        } else {
            setPromoApplied(null);
            setPromoError('Invalid promo code. Try SOLESTREET, SHOE20, SNEAKER10, BOOTS25, or COMFY15.');
        }
    };

    /* Submit Checkout Form */
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        // 1. Validate contact info
        if (!contact.firstName.trim() || !contact.lastName.trim()) {
            setError('Please fill in your first and last name.');
            return;
        }
        if (!contact.email.trim() || !/^\S+@\S+\.\S+$/.test(contact.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!contact.mobile || contact.mobile.length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        // 2. Validate shipping address
        if (!address.address.trim()) {
            setError('Please enter your full street address.');
            return;
        }
        if (!address.city.trim()) {
            setError('Please enter your city.');
            return;
        }
        if (!address.state) {
            setError('Please select a shipping state.');
            return;
        }
        if (!address.pincode || address.pincode.length < 6) {
            setError('Please enter a valid 6-digit pincode.');
            return;
        }

        // 3. Validate payment details
        if (payment.paymentType !== 'Cash on Delivery') {
            if (payment.paymentType === 'Credit Card' || payment.paymentType === 'Debit Card') {
                if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, '').length < 16) {
                    setError('Please enter a valid 16-digit card number.');
                    return;
                }
                if (!payment.expiry || !/^\d{2}\/\d{2}$/.test(payment.expiry)) {
                    setError('Please enter expiry date in MM/YY format.');
                    return;
                }
                if (!payment.cvv || payment.cvv.length < 3) {
                    setError('Please enter a valid 3-digit CVV code.');
                    return;
                }
            } else if (payment.paymentType === 'Net Banking') {
                if (!payment.bankName) {
                    setError('Please select your preferred bank.');
                    return;
                }
            } else if (payment.paymentType === 'UPI') {
                if (!payment.bankName || !payment.bankName.includes('@')) {
                    setError('Please enter a valid UPI ID (e.g. name@upi).');
                    return;
                }
            }
        }

        setError('');
        setLoading(true);

        try {
            const shippingAddress = {
                address: address.address,
                city: `${address.city}, ${address.state}`,
                pincode: address.pincode,
                landmark: address.landmark,
                shippingMethod,
                orderNotes
            };

            // Post order to backend
            const { data: order } = await API.post('/orders/place', { shippingAddress });
            
            // Process fake payment transaction
            await API.post('/payments/process', {
                orderId: order._id,
                paymentType: payment.paymentType,
                bankName: payment.bankName || payment.paymentType,
                branch: address.city,
                cardNumber: payment.cardNumber ? payment.cardNumber.slice(-4) : 'COD',
                amount: grandTotal
            });

            await fetchCart();
            navigate('/order-success');
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout placement failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="empty-state-page">
                <div className="empty-state-card">
                    <div className="empty-state-icon"><FaCreditCard /></div>
                    <h2 className="empty-state-title">Nothing to Checkout</h2>
                    <p className="empty-state-text">Your cart is currently empty. Shop the latest items and return here!</p>
                    <Link to="/" className="btn-primary-lg">Shop Catalog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Page Header */}
            <div className="checkout-page-header">
                <Link to="/cart" className="checkout-back-link">
                    <FaArrowLeft /> Back to Cart
                </Link>
                <div className="checkout-page-title-wrap">
                    <FaCreditCard className="checkout-page-icon" />
                    <div>
                        <h1 className="checkout-page-title">Secure Unified Checkout</h1>
                        <p className="checkout-page-sub">
                            <FaShieldAlt style={{ color: 'var(--success)', fontSize: '12px' }} /> 
                            &nbsp;256-bit SSL Encrypted Connection · Safe & Trusted Shopping
                        </p>
                    </div>
                </div>
            </div>

            {error && <div className="error-msg checkout-error-banner">{error}</div>}

            <div className="checkout-layout">
                {/* ── LEFT COLUMN: Scrollable Form Container ── */}
                <div className="checkout-form-col">
                    <form onSubmit={handlePlaceOrder} className="checkout-single-form-wrapper">
                        
                        {/* Scroll Area Overlay Indicator */}
                        <div className="scroll-area-badge">
                            <span>📜 Scrollable Single Checkout Form</span>
                        </div>
                        
                        <div className="checkout-form-scroll-container">
                            
                            {/* SECTION 1: Contact Information */}
                            <div className="checkout-form-panel">
                                <h3 className="panel-heading">
                                    <span className="panel-step-badge">1</span>
                                    <FaUser /> Contact Details
                                </h3>
                                <div className="panel-grid">
                                    <div className="form-field">
                                        <label><FaUser /> First Name *</label>
                                        <input
                                            type="text"
                                            placeholder="First name"
                                            value={contact.firstName}
                                            onChange={e => setContact({ ...contact, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label><FaUser /> Last Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Last name"
                                            value={contact.lastName}
                                            onChange={e => setContact({ ...contact, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-field form-field-full">
                                        <label><FaEnvelope /> Email Address *</label>
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={contact.email}
                                            onChange={e => setContact({ ...contact, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-field form-field-full">
                                        <label><FaMobileAlt /> Mobile Number *</label>
                                        <input
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            value={contact.mobile}
                                            onChange={e => setContact({ ...contact, mobile: e.target.value.replace(/\D/g, '') })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Shipping & Delivery Address */}
                            <div className="checkout-form-panel">
                                <h3 className="panel-heading">
                                    <span className="panel-step-badge">2</span>
                                    <FaMapMarkerAlt /> Shipping & Delivery Address
                                </h3>
                                <div className="panel-grid">
                                    <div className="form-field form-field-full">
                                        <label><FaMapMarkerAlt /> Full Address / Flat / House / Street *</label>
                                        <textarea
                                            placeholder="e.g. Flat 3A, Tower 2, Green Heights Apartment, MG Road"
                                            value={address.address}
                                            onChange={e => setAddress({ ...address, address: e.target.value })}
                                            required
                                            rows={2.5}
                                            className="checkout-textarea"
                                        />
                                    </div>
                                    <div className="form-field form-field-full">
                                        <label><FaMapMarkerAlt /> Landmark (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Near park, behind metro station..."
                                            value={address.landmark}
                                            onChange={e => setAddress({ ...address, landmark: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label><FaCity /> City / District *</label>
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label><FaMapMarkerAlt /> State *</label>
                                        <select
                                            value={address.state}
                                            onChange={e => setAddress({ ...address, state: e.target.value })}
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {[
                                                'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
                                                'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
                                                'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
                                                'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
                                                'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
                                                'Uttarakhand','West Bengal'
                                            ].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-field form-field-full">
                                        <label><FaHashtag /> ZIP / PIN Code *</label>
                                        <input
                                            type="text"
                                            placeholder="6-digit PIN code"
                                            maxLength={6}
                                            value={address.pincode}
                                            onChange={e => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: Shipping Method & Order Notes */}
                            <div className="checkout-form-panel">
                                <h3 className="panel-heading">
                                    <span className="panel-step-badge">3</span>
                                    <FaTruck /> Delivery Speed & Instructions
                                </h3>
                                <div className="panel-grid">
                                    <div className="form-field form-field-full">
                                        <label><FaTruck /> Choose Shipping Method</label>
                                        <div className="shipping-methods-grid">
                                            <label className={`shipping-method-card ${shippingMethod === 'standard' ? 'selected' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name="shippingMethod" 
                                                    value="standard" 
                                                    checked={shippingMethod === 'standard'}
                                                    onChange={() => setShippingMethod('standard')}
                                                />
                                                <div className="sm-info">
                                                    <span className="sm-title">Standard Shipping</span>
                                                    <span className="sm-duration">Delivered in 5-7 business days</span>
                                                </div>
                                                <span className="sm-price">{subtotal >= 1000 ? 'FREE' : '₹99'}</span>
                                            </label>

                                            <label className={`shipping-method-card ${shippingMethod === 'express' ? 'selected' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name="shippingMethod" 
                                                    value="express" 
                                                    checked={shippingMethod === 'express'}
                                                    onChange={() => setShippingMethod('express')}
                                                />
                                                <div className="sm-info">
                                                    <span className="sm-title">⚡ Express Delivery</span>
                                                    <span className="sm-duration">Delivered in 1-2 business days</span>
                                                </div>
                                                <span className="sm-price">₹99</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-field form-field-full">
                                        <label><FaRegCommentAlt /> Delivery Instructions / Order Notes (Optional)</label>
                                        <textarea
                                            placeholder="Write special requests (e.g. 'Leave with guard', 'Call before arrival', 'Deliver after 5 PM')"
                                            value={orderNotes}
                                            onChange={e => setOrderNotes(e.target.value)}
                                            rows={2}
                                            className="checkout-textarea"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: Payment Method */}
                            <div className="checkout-form-panel" style={{ borderBottom: 'none', paddingBottom: '10px' }}>
                                <h3 className="panel-heading">
                                    <span className="panel-step-badge">4</span>
                                    <FaCreditCard /> Secure Payment Option
                                </h3>
                                <div className="panel-grid">
                                    <div className="form-field form-field-full">
                                        <label><FaWallet /> Preferred Mode of Payment</label>
                                        <div className="payment-method-selector-grid">
                                            {[
                                                { id: 'Credit Card',    icon: '💳', label: 'Credit Card' },
                                                { id: 'Debit Card',     icon: '🏧', label: 'Debit Card' },
                                                { id: 'Net Banking',    icon: '🏦', label: 'Net Banking' },
                                                { id: 'UPI',            icon: '📱', label: 'UPI ID / GPay' },
                                                { id: 'Cash on Delivery', icon: '💵', label: 'COD' },
                                            ].map(m => (
                                                <label
                                                    key={m.id}
                                                    className={`payment-choice-card ${payment.paymentType === m.id ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentType"
                                                        value={m.id}
                                                        checked={payment.paymentType === m.id}
                                                        onChange={e => setPayment({ ...payment, paymentType: e.target.value })}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <span className="pc-icon">{m.icon}</span>
                                                    <span className="pc-label">{m.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card fields */}
                                    {(payment.paymentType === 'Credit Card' || payment.paymentType === 'Debit Card') && (
                                        <div className="payment-sub-form">
                                            <div className="form-field form-field-full">
                                                <label><FaCreditCard /> Card Number *</label>
                                                <input
                                                    type="text"
                                                    placeholder="4111 2222 3333 4444"
                                                    maxLength={19}
                                                    value={payment.cardNumber}
                                                    onChange={e => {
                                                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                        setPayment({ ...payment, cardNumber: v.replace(/(.{4})/g, '$1 ').trim() });
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="form-row-2col">
                                                <div className="form-field">
                                                    <label>Expiry (MM/YY) *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        value={payment.expiry}
                                                        onChange={e => {
                                                            let v = e.target.value.replace(/\D/g, '');
                                                            if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2,4);
                                                            setPayment({ ...payment, expiry: v });
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label><FaLock /> CVV *</label>
                                                    <input
                                                        type="password"
                                                        placeholder="•••"
                                                        maxLength={3}
                                                        value={payment.cvv}
                                                        onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '') })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-field form-field-full" style={{ marginTop: '12px' }}>
                                                <label>Issuing Bank Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                                                    value={payment.bankName}
                                                    onChange={e => setPayment({ ...payment, bankName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {payment.paymentType === 'Net Banking' && (
                                        <div className="payment-sub-form">
                                            <div className="form-field form-field-full">
                                                <label><FaUniversity /> Choose Bank Account *</label>
                                                <select
                                                    value={payment.bankName}
                                                    onChange={e => setPayment({ ...payment, bankName: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Popular Bank</option>
                                                    {['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Bank of Baroda','Punjab National Bank','Yes Bank','IDBI Bank','Canara Bank'].map(b => (
                                                        <option key={b} value={b}>{b}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {payment.paymentType === 'UPI' && (
                                        <div className="payment-sub-form">
                                            <div className="form-field form-field-full">
                                                <label><FaMobileAlt /> UPI ID *</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. user@okhdfcbank or phone@upi"
                                                    value={payment.bankName}
                                                    onChange={e => setPayment({ ...payment, bankName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {payment.paymentType === 'Cash on Delivery' && (
                                        <div className="cod-notice-panel">
                                            <FaTruck className="cod-notice-icon" />
                                            <div>
                                                <span className="cod-notice-title">Cash on Delivery (COD) Selected</span>
                                                <p className="cod-notice-text">
                                                    You'll pay a total of <strong>₹{(grandTotal).toLocaleString('en-IN')}</strong> in cash upon physical package delivery. A small COD convenience fee of ₹25 applies.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-field form-field-full ssl-badge-field">
                                        <div className="ssl-lock-badge">
                                            <FaShieldAlt /> Your secure transaction is processed via high-grade 256-bit SSL encryption.
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>

                {/* ── RIGHT COLUMN: Sticky Order Summary Card ── */}
                <div className="checkout-summary-col">
                    <div className="checkout-summary-sticky">
                        <h3 className="checkout-summary-heading">
                            <FaGift /> Order Summary
                            <span className="checkout-item-count">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                        </h3>

                        {/* cart Items scroll list */}
                        <div className="checkout-items-scroll">
                            {cart.items.map((item) => (
                                <div key={item._id} className="checkout-item-row">
                                    {item.product?.images?.[0] && (
                                        <img
                                            src={
                                                (() => {
                                                    const img = item.product.images[0];
                                                    if (!img || typeof img !== 'string' || img.trim() === '') return '/placeholder.png';
                                                    if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                                    return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
                                                })()
                                            }
                                            alt={item.product?.name}
                                            className="checkout-item-thumb"
                                        />
                                    )}
                                    <div className="checkout-item-info">
                                        <span className="checkout-item-name">{item.product?.name}</span>
                                        <span className="checkout-item-meta">
                                            Qty: {item.quantity}
                                            {item.size ? ` · Size: ${item.size}` : ''}
                                        </span>
                                    </div>
                                    <span className="checkout-item-price">
                                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Promo Code Discount */}
                        <div className="checkout-promo-section">
                            <label className="promo-label"><FaGift /> Enter Coupon / Promo Code</label>
                            <div className="promo-input-row">
                                <input
                                    type="text"
                                    placeholder="e.g. SOLESTREET, SHOE20..."
                                    value={promoInput}
                                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                                    className="promo-input"
                                />
                                <button type="button" onClick={applyPromo} className="promo-apply-btn">Apply</button>
                            </div>
                            {promoError && <p className="promo-error">{promoError}</p>}
                            {promoApplied && (
                                <div className="promo-success">
                                    <FaCheckCircle /> <strong>{promoApplied.code}</strong> coupon applied! — {promoApplied.label}
                                </div>
                            )}
                        </div>

                        {/* Pricing details */}
                        <div className="checkout-totals">
                            <div className="checkout-total-row">
                                <span>Cart Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="checkout-total-row">
                                <span>Shipping & Handling ({shippingMethod === 'express' ? '⚡ Express' : 'Standard'})</span>
                                <span className={shipping === 0 ? 'text-success font-semibold' : ''}>
                                    {shipping === 0 ? '✓ FREE' : `₹${shipping}`}
                                </span>
                            </div>

                            {promoApplied && (
                                <div className="checkout-total-row discount-row">
                                    <span>Promo discount ({promoApplied.code})</span>
                                    <span>− ₹{discount.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            {payment.paymentType === 'Cash on Delivery' && (
                                <div className="checkout-total-row cod-row">
                                    <span>COD Convenience Fee</span>
                                    <span>₹25</span>
                                </div>
                            )}

                            <div className="checkout-grand-total-row">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Shipping alert if not free */}
                        {subtotal < 1000 && shippingMethod === 'standard' && (
                            <div className="free-ship-notice">
                                <FaTruck /> Buy <strong>₹{(1000 - subtotal).toLocaleString('en-IN')}</strong> more products to get **FREE Shipping**!
                            </div>
                        )}

                        {/* Big Submit Button right in the sticky card! */}
                        <div className="checkout-action-wrap" style={{ marginTop: '20px' }}>
                            <button 
                                type="button" 
                                onClick={handlePlaceOrder} 
                                className="btn-place-order" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <><span className="btn-spinner" /> Booking order...</>
                                ) : (
                                    <>🔒 Place Order · ₹{grandTotal.toLocaleString('en-IN')}</>
                                )}
                            </button>
                        </div>

                        {/* trust icons */}
                        <div className="checkout-trust-badges">
                            <span><FaShieldAlt /> 100% Secure Checkout</span>
                            <span><FaTruck /> Express & Safe Delivery</span>
                            <span>↩️ 7-Day Free Returns</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
