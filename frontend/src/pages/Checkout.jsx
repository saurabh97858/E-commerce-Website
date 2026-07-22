import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
    FaCreditCard, FaUniversity, FaShieldAlt, FaArrowLeft,
    FaUser, FaMapMarkerAlt, FaCheckCircle, FaMobileAlt, 
    FaEnvelope, FaCity, FaHashtag, FaWallet, FaTruck, FaGift, 
    FaRegCommentAlt
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

    /* Form Fields state - Pre-filled if user is logged in */
    const [contact, setContact] = useState({
        firstName: user?.name ? user.name.split(' ')[0] : '',
        lastName:  user?.surname || (user?.name ? user.name.split(' ').slice(1).join(' ') : ''),
        email:     user?.email || '',
        mobile:    user?.mobile || ''
    });

    const [address, setAddress] = useState({
        address: '', city: '', state: 'Bihar', pincode: '', landmark: ''
    });

    const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' or 'express'
    const [orderNotes, setOrderNotes] = useState('');

    /* Default payment method to Cash on Delivery (COD) for 1-click checkout! */
    const [payment, setPayment] = useState({
        paymentType: 'Cash on Delivery', cardNumber: '', expiry: '', cvv: '', bankName: ''
    });

    /* Promo code state */
    const [promoInput, setPromoInput] = useState('');
    const [promoApplied, setPromoApplied] = useState(null);
    const [promoError, setPromoError] = useState('');

    /* Pre-fill details from logged-in user profile & saved active address */
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;
            try {
                const { data } = await API.get('/auth/profile');
                if (data) {
                    const nameParts = (data.name || '').split(' ');
                    setContact(prev => ({
                        firstName: prev.firstName || nameParts[0] || '',
                        lastName:  data.surname || prev.lastName || nameParts.slice(1).join(' ') || '',
                        email:     data.email || prev.email || '',
                        mobile:    data.mobile || prev.mobile || ''
                    }));

                    // Check active address in localStorage or default profile address
                    let activeAddress = null;
                    try {
                        const storedAddrs = localStorage.getItem(`addresses_${user._id}`);
                        const activeId = localStorage.getItem(`active_address_id_${user._id}`);
                        if (storedAddrs && activeId) {
                            const list = JSON.parse(storedAddrs);
                            activeAddress = list.find(a => a.id === activeId);
                        }
                    } catch {
                        activeAddress = null;
                    }

                    const addrToUse = activeAddress || {
                        address: data.address || '',
                        city: data.city || '',
                        pincode: data.pincode || ''
                    };

                    setAddress(prev => ({
                        ...prev,
                        address: addrToUse.address || prev.address || '',
                        city:    addrToUse.city    || prev.city    || '',
                        pincode: addrToUse.pincode || prev.pincode || ''
                    }));
                }
            } catch (error) {
                console.error("Error fetching user profile at checkout:", error);
            }
        };
        fetchUserProfile();
    }, [user]);

    /* Auto-fetch City and State from PIN Code */
    useEffect(() => {
        const fetchCityState = async () => {
            if (address.pincode && address.pincode.length === 6) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${address.pincode}`);
                    const data = await response.json();
                    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
                        const postOffice = data[0].PostOffice[0];
                        setAddress(prev => ({
                            ...prev,
                            city: postOffice.District || postOffice.Division || prev.city || '',
                            state: postOffice.State || prev.state || 'Bihar'
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching PIN details:", error);
                }
            }
        };
        fetchCityState();
    }, [address.pincode]);

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
        if (e) e.preventDefault();
        
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

        // 3. Validate payment details ONLY if Card is selected!
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

            // Auto-save this shipping address to the user's profile if logged in
            if (user) {
                try {
                    await API.put('/auth/profile', {
                        address: address.address,
                        city: `${address.city}, ${address.state}`,
                        pincode: address.pincode,
                        mobile: contact.mobile
                    });
                } catch (profileSaveErr) {
                    console.error("Failed to auto-save address to user profile:", profileSaveErr);
                }
            }
            
            // Process payment transaction
            await API.post('/payments/process', {
                orderId: order._id,
                paymentType: payment.paymentType,
                bankName: payment.bankName || payment.paymentType,
                branch: address.city,
                cardNumber: payment.cardNumber ? payment.cardNumber.slice(-4) : payment.paymentType,
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
        <div className="checkout-page checkout-page-compact">
            {/* Page Header */}
            <div className="checkout-page-header">
                <Link to="/cart" className="checkout-back-link">
                    <FaArrowLeft /> Back to Cart
                </Link>
                <div className="checkout-page-title-wrap">
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
                {/* ── LEFT COLUMN: Clean Compact Form ── */}
                <div className="checkout-form-col">
                    <form onSubmit={handlePlaceOrder} className="checkout-single-form-wrapper">
                        
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
                                <FaMapMarkerAlt /> Shipping Address
                            </h3>
                            <div className="panel-grid">
                                <div className="form-field form-field-full">
                                    <label><FaMapMarkerAlt /> Full Address / Flat / House / Street *</label>
                                    <textarea
                                        placeholder="e.g. Flat 3A, Tower 2, Green Heights Apartment, MG Road"
                                        value={address.address}
                                        onChange={e => setAddress({ ...address, address: e.target.value })}
                                        required
                                        rows={2}
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
                                    <label><FaHashtag /> PIN Code (Auto City Lookup) *</label>
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
                                                <span className="sm-title">Standard Delivery</span>
                                                <span className="sm-duration">5-7 business days</span>
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
                                                <span className="sm-duration">1-2 business days</span>
                                            </div>
                                            <span className="sm-price">₹99</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-field form-field-full">
                                    <label><FaRegCommentAlt /> Delivery Notes (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Leave with guard / call before delivery"
                                        value={orderNotes}
                                        onChange={e => setOrderNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Payment Option */}
                        <div className="checkout-form-panel" style={{ borderBottom: 'none' }}>
                            <h3 className="panel-heading">
                                <span className="panel-step-badge">4</span>
                                <FaCreditCard /> Payment Option
                            </h3>
                            <div className="panel-grid">
                                <div className="form-field form-field-full">
                                    <div className="payment-method-selector-grid">
                                        {[
                                            { id: 'Cash on Delivery', icon: '💵', label: 'Cash on Delivery (COD)' },
                                            { id: 'UPI',            icon: '📱', label: 'UPI / GPay / Paytm' },
                                            { id: 'Credit Card',    icon: '💳', label: 'Credit Card' },
                                            { id: 'Debit Card',     icon: '🏧', label: 'Debit Card' },
                                            { id: 'Net Banking',    icon: '🏦', label: 'Net Banking' },
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

                                {payment.paymentType === 'Cash on Delivery' && (
                                    <div className="cod-notice-panel">
                                        <FaTruck className="cod-notice-icon" />
                                        <div>
                                            <span className="cod-notice-title">✓ Cash on Delivery (COD) Selected</span>
                                            <p className="cod-notice-text">
                                                Pay <strong>₹{(grandTotal).toLocaleString('en-IN')}</strong> in cash upon package delivery. A small COD handling fee of ₹25 applies.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {payment.paymentType === 'UPI' && (
                                    <div className="payment-sub-form">
                                        <div className="form-field form-field-full">
                                            <label><FaMobileAlt /> Enter UPI ID (Google Pay / PhonePe / Paytm / BHIM) *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. mobile@upi or name@okaxis"
                                                value={payment.bankName}
                                                onChange={e => setPayment({ ...payment, bankName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

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
                                                <label>CVV *</label>
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
                                                <option value="">Select Bank</option>
                                                {['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Bank of Baroda','Punjab National Bank','Yes Bank'].map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

                {/* ── RIGHT COLUMN: Compact Order Summary Card ── */}
                <div className="checkout-summary-col">
                    <div className="checkout-summary-box">
                        <h3 className="checkout-summary-heading">
                            <FaGift /> Order Summary
                            <span className="checkout-item-count">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                        </h3>

                        {/* cart Items list */}
                        <div className="checkout-items-mini-list">
                            {cart.items.map((item) => (
                                <div key={item._id} className="checkout-item-row">
                                    <img
                                        src={
                                            (() => {
                                                const img = item.product?.images?.[0];
                                                const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%2316162a'/%3E%3Ctext x='50%25' y='55%25' font-family='Arial' font-size='24' fill='%23e94560' text-anchor='middle'%3E👟%3C/text%3E%3C/svg%3E";
                                                if (!img || typeof img !== 'string' || img.trim() === '') return placeholder;
                                                if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                let path = img;
                                                if (!path.startsWith('/uploads/') && !path.startsWith('uploads/')) {
                                                    path = '/uploads/' + (path.startsWith('/') ? path.slice(1) : path);
                                                } else if (path.startsWith('uploads/')) {
                                                    path = '/' + path;
                                                }
                                                const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                                return `${baseUrl}${path}`;
                                            })()
                                        }
                                        alt={item.product?.name}
                                        className="checkout-item-thumb"
                                    />
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
                            <div className="promo-input-row">
                                <input
                                    type="text"
                                    placeholder="Enter Promo Code"
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
                                    <FaCheckCircle /> <strong>{promoApplied.code}</strong> ({promoApplied.label})
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
                                <span>Shipping ({shippingMethod === 'express' ? '⚡ Express' : 'Standard'})</span>
                                <span className={shipping === 0 ? 'text-success font-semibold' : ''}>
                                    {shipping === 0 ? '✓ FREE' : `₹${shipping}`}
                                </span>
                            </div>

                            {promoApplied && (
                                <div className="checkout-total-row discount-row">
                                    <span>Discount ({promoApplied.code})</span>
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
                                <span>Total Amount</span>
                                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Action Submit Button */}
                        <div className="checkout-action-wrap" style={{ marginTop: '16px' }}>
                            <button 
                                type="button" 
                                onClick={handlePlaceOrder} 
                                className="btn-place-order" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <><span className="btn-spinner" /> Placing order...</>
                                ) : (
                                    <>🔒 Place Order · ₹{grandTotal.toLocaleString('en-IN')}</>
                                )}
                            </button>
                        </div>

                        <div className="checkout-trust-badges">
                            <span><FaShieldAlt /> 100% Secure Checkout</span>
                            <span><FaTruck /> Fast & Safe Delivery</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
