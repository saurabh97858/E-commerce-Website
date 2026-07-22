import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { 
    FaUser, FaBox, FaMapMarkerAlt, FaPlus, FaCheckCircle, FaCheck, 
    FaTimes, FaCog, FaQuestionCircle, FaUserPlus, FaSignOutAlt, 
    FaPhone, FaEnvelope, FaEdit, FaChevronRight, FaChevronDown,
    FaCalendarAlt, FaRupeeSign, FaTruck, FaShippingFast, FaClock, FaTimesCircle
} from 'react-icons/fa';

const statusSteps = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];

const StatusTracker = ({ status }) => {
    if (status === 'Cancelled') {
        return (
            <div className="order-tracker cancelled-tracker">
                <FaTimesCircle style={{ color: 'var(--danger)', fontSize: '18px' }} />
                <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '14px' }}>Order Cancelled</span>
            </div>
        );
    }
    const currentIndex = statusSteps.indexOf(status);
    return (
        <div className="order-tracker">
            {statusSteps.map((step, idx) => {
                const isDone = idx <= currentIndex;
                const isActive = idx === currentIndex;
                return (
                    <div key={step} className={`tracker-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="tracker-dot">
                            {isDone ? <FaCheckCircle /> : <span>{idx + 1}</span>}
                        </div>
                        <span className="tracker-label">{step}</span>
                        {idx < statusSteps.length - 1 && (
                            <div className={`tracker-line ${idx < currentIndex ? 'done' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const UserProfileModal = ({ isOpen, onClose, onSwitchAccount }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile' | 'settings' | 'help'
    
    // User Profile state
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    
    // Edit Profile state
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', surname: '', mobile: '', gender: 'Male' });
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Orders state
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Addresses state
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [activeAddressId, setActiveAddressId] = useState(null);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddr, setNewAddr] = useState({ title: 'Home', address: '', city: '', pincode: '', mobile: '' });
    const [addrMsg, setAddrMsg] = useState({ type: '', text: '' });

    // Settings state
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: true,
        emailOffers: true
    });

    // Help Center FAQ collapse state
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchUserProfile();
            fetchOrders();
            loadAddresses();
        }
    }, [isOpen, user]);

    const fetchUserProfile = async () => {
        setLoadingProfile(true);
        try {
            const { data } = await API.get('/auth/profile');
            setProfile(data);
            setProfileForm({
                name: data.name || '',
                surname: data.surname || '',
                mobile: data.mobile || '',
                gender: data.gender || 'Male'
            });
        } catch (err) {
            console.error('Error fetching profile in modal:', err);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const { data } = await API.get('/orders/my-orders');
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const loadAddresses = async () => {
        // Retrieve addresses from profile and localStorage
        try {
            const { data } = await API.get('/auth/profile');
            const primaryAddr = data.address ? {
                id: 'primary',
                title: 'Primary / Default Address',
                address: data.address,
                city: data.city,
                pincode: data.pincode,
                mobile: data.mobile
            } : null;

            let extraAddrs = [];
            try {
                const stored = localStorage.getItem(`addresses_${user._id}`);
                if (stored) extraAddrs = JSON.parse(stored);
            } catch {
                extraAddrs = [];
            }

            const list = primaryAddr ? [primaryAddr, ...extraAddrs] : extraAddrs;
            setSavedAddresses(list);

            const activeId = localStorage.getItem(`active_address_id_${user._id}`) || (list.length > 0 ? list[0].id : null);
            setActiveAddressId(activeId);
        } catch (err) {
            console.error('Error loading addresses:', err);
        }
    };

    /* Auto-fetch City from PIN Code in Add Address */
    useEffect(() => {
        const fetchCity = async () => {
            if (newAddr.pincode && newAddr.pincode.length === 6) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${newAddr.pincode}`);
                    const data = await response.json();
                    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
                        const postOffice = data[0].PostOffice[0];
                        setNewAddr(prev => ({
                            ...prev,
                            city: postOffice.District || postOffice.Division || ''
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching PIN details:", err);
                }
            }
        };
        fetchCity();
    }, [newAddr.pincode]);

    if (!isOpen || !user) return null;

    const handleSelectAddress = (id) => {
        setActiveAddressId(id);
        localStorage.setItem(`active_address_id_${user._id}`, id);
        setAddrMsg({ type: 'success', text: 'Active shipping address updated!' });
        setTimeout(() => setAddrMsg({ type: '', text: '' }), 2500);
    };

    const handleAddAddressSubmit = async (e) => {
        e.preventDefault();
        if (!newAddr.address || !newAddr.pincode || !newAddr.city) return;

        const newId = 'addr_' + Date.now();
        const addressObj = { id: newId, ...newAddr };

        let extraAddrs = [];
        try {
            const stored = localStorage.getItem(`addresses_${user._id}`);
            if (stored) extraAddrs = JSON.parse(stored);
        } catch {
            extraAddrs = [];
        }

        const updatedExtra = [...extraAddrs, addressObj];
        localStorage.setItem(`addresses_${user._id}`, JSON.stringify(updatedExtra));
        
        setSavedAddresses(prev => [...prev, addressObj]);
        handleSelectAddress(newId);

        // Also update backend user profile if no address exists yet
        if (!profile?.address || profile.address === 'No saved address') {
            try {
                await API.put('/auth/profile', {
                    address: newAddr.address,
                    city: newAddr.city,
                    pincode: newAddr.pincode,
                    mobile: newAddr.mobile || profile?.mobile
                });
            } catch (err) {
                console.error('Error saving primary address to profile:', err);
            }
        }

        setShowAddAddress(false);
        setNewAddr({ title: 'Home', address: '', city: '', pincode: '', mobile: '' });
        setAddrMsg({ type: 'success', text: 'New address added successfully!' });
        setTimeout(() => setAddrMsg({ type: '', text: '' }), 2500);
    };

    const handleProfileUpdateSubmit = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: '', text: '' });
        try {
            const { data } = await API.put('/auth/profile', profileForm);
            setProfile(data.user);
            setEditMode(false);
            setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
            setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        }
    };

    const handleLogout = () => {
        onClose();
        logout();
    };

    const statusColorMap = {
        'Pending': 'var(--warning)',
        'Shipped': '#3b82f6',
        'Out for Delivery': '#8b5cf6',
        'Delivered': 'var(--success)',
        'Cancelled': 'var(--danger)'
    };

    const faqs = [
        { q: "How can I track my order?", a: "Go to 'My Orders' section inside this modal and click on your order to view live progress status." },
        { q: "What are the shipping charges?", a: "Free shipping is available on all orders above ₹1,000 across Patna and India!" },
        { q: "How do I add a new delivery address?", a: "Go to the 'Addresses' tab, click '+ Add New Address', fill in your details and select the tick radio button to set it as default." },
        { q: "What is the return & exchange policy?", a: "We offer hassle-free 7-day returns & exchanges for un-worn shoes in original packaging." }
    ];

    return (
        <div className="user-modal-backdrop" onClick={onClose}>
            <div className="user-modal-container" onClick={(e) => e.stopPropagation()}>
                
                {/* Header Banner */}
                <div className="user-modal-header shadow-glow">
                    <div className="user-info-bar">
                        <div className="user-modal-avatar-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-modal-info">
                            <h3>{user.name} {profile?.surname || ''}</h3>
                            <p>{user.email}</p>
                            <span className="user-modal-badge">{user.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button className="user-modal-close" onClick={onClose} aria-label="Close modal">
                        <FaTimes />
                    </button>
                </div>

                {/* Main Body with Sidebar Navigation & Content */}
                <div className="user-modal-body">
                    
                    {/* Navigation Sidebar / Tabs */}
                    <div className="user-modal-nav">
                        <button 
                            className={`user-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                        >
                            <FaBox /> <span>My Orders</span>
                            {orders.length > 0 && <span className="nav-count-badge">{orders.length}</span>}
                        </button>
                        <button 
                            className={`user-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            <FaMapMarkerAlt /> <span>Saved Addresses</span>
                        </button>
                        <button 
                            className={`user-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FaUser /> <span>Account Details</span>
                        </button>
                        <button 
                            className={`user-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <FaCog /> <span>Settings</span>
                        </button>
                        <button 
                            className={`user-nav-btn ${activeTab === 'help' ? 'active' : ''}`}
                            onClick={() => setActiveTab('help')}
                        >
                            <FaQuestionCircle /> <span>Help Center</span>
                        </button>

                        <div className="user-nav-divider" />

                        <button 
                            className="user-nav-btn switch-account-btn"
                            onClick={() => { onClose(); if (onSwitchAccount) onSwitchAccount(); }}
                        >
                            <FaUserPlus /> <span>Add / Switch Account</span>
                        </button>

                        <button 
                            className="user-nav-btn logout-nav-btn"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> <span>Sign Out</span>
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div className="user-modal-content-panel">
                        
                        {/* ─── ORDERS TAB ────────────────────────────── */}
                        {activeTab === 'orders' && (
                            <div className="tab-pane">
                                {!selectedOrder ? (
                                    <>
                                        <div className="pane-title-row">
                                            <h4>My Orders</h4>
                                            <span>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                                        </div>

                                        {loadingOrders ? (
                                            <div className="pane-loader">Loading orders...</div>
                                        ) : orders.length === 0 ? (
                                            <div className="pane-empty">
                                                <div className="empty-icon">📦</div>
                                                <h5>No orders placed yet</h5>
                                                <p>Explore our collection and place your first order!</p>
                                            </div>
                                        ) : (
                                            <div className="orders-mini-list">
                                                {orders.map((ord) => {
                                                    const placedDate = new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    });
                                                    return (
                                                        <div key={ord._id} className="order-mini-card" onClick={() => setSelectedOrder(ord)}>
                                                            <div className="order-mini-top">
                                                                <span className="order-mini-id">ORDER #{ord._id.slice(-8).toUpperCase()}</span>
                                                                <span className="order-status-pill-sm" style={{ background: `${statusColorMap[ord.status]}22`, color: statusColorMap[ord.status] }}>
                                                                    {ord.status}
                                                                </span>
                                                            </div>
                                                            <div className="order-mini-mid">
                                                                <span className="order-mini-date"><FaCalendarAlt /> {placedDate}</span>
                                                                <span className="order-mini-total">₹{ord.totalAmount?.toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="order-mini-items-preview">
                                                                <span>{ord.items?.length} item{ord.items?.length !== 1 ? 's' : ''}: {ord.items?.map(i => i.name).join(', ')}</span>
                                                            </div>
                                                            <div className="order-mini-footer">
                                                                <span>Click to view full order details</span>
                                                                <FaChevronRight />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* SINGLE ORDER DETAILS VIEW */
                                    <div className="order-details-pane">
                                        <button className="back-to-orders-btn" onClick={() => setSelectedOrder(null)}>
                                            ← Back to all orders
                                        </button>

                                        <div className="order-details-header">
                                            <div>
                                                <h4>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h4>
                                                <p className="order-detail-date">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                            <span className="order-status-pill" style={{ background: `${statusColorMap[selectedOrder.status]}22`, color: statusColorMap[selectedOrder.status], borderColor: `${statusColorMap[selectedOrder.status]}44` }}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>

                                        {/* Status Tracker */}
                                        <div className="order-block">
                                            <h5>Order Status Tracker</h5>
                                            <StatusTracker status={selectedOrder.status} />
                                        </div>

                                        {/* Booked Items */}
                                        <div className="order-block">
                                            <h5>Booked Items ({selectedOrder.items?.length})</h5>
                                            <div className="order-items-detail-list">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="order-item-detail-row">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="order-item-img" />
                                                        ) : (
                                                            <div className="order-item-img-placeholder">👟</div>
                                                        )}
                                                        <div className="order-item-text">
                                                            <h6>{item.name}</h6>
                                                            <div className="order-item-pills">
                                                                {item.size && <span className="item-pill">Size: {item.size}</span>}
                                                                <span className="item-pill">Qty: {item.quantity}</span>
                                                                <span className="item-pill price-pill">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        {selectedOrder.shippingAddress && (
                                            <div className="order-block">
                                                <h5>Delivery Address</h5>
                                                <div className="order-address-card">
                                                    <p><strong>Address:</strong> {selectedOrder.shippingAddress.address}</p>
                                                    <p><strong>City/District:</strong> {selectedOrder.shippingAddress.city}</p>
                                                    <p><strong>Pincode:</strong> {selectedOrder.shippingAddress.pincode}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total Summary */}
                                        <div className="order-block total-summary-block">
                                            <div className="summary-row">
                                                <span>Subtotal</span>
                                                <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Delivery Charges</span>
                                                <span style={{ color: 'var(--success)' }}>FREE</span>
                                            </div>
                                            <div className="summary-row grand-total">
                                                <span>Total Amount</span>
                                                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── SAVED ADDRESSES TAB ───────────────────── */}
                        {activeTab === 'addresses' && (
                            <div className="tab-pane">
                                <div className="pane-title-row">
                                    <h4>Saved Delivery Addresses</h4>
                                    <button className="add-address-btn" onClick={() => setShowAddAddress(!showAddAddress)}>
                                        <FaPlus /> {showAddAddress ? 'Cancel' : 'Add New Address'}
                                    </button>
                                </div>

                                {addrMsg.text && (
                                    <div className={`auth-alert-v2 ${addrMsg.type}`} style={{ marginBottom: '12px' }}>
                                        {addrMsg.text}
                                    </div>
                                )}

                                {/* Add New Address Form */}
                                {showAddAddress && (
                                    <form onSubmit={handleAddAddressSubmit} className="add-address-form">
                                        <h5>Create New Shipping Address</h5>
                                        <div className="auth-field">
                                            <label>Address Tag (e.g., Home, Office)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Home / Work" 
                                                value={newAddr.title} 
                                                onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="auth-field">
                                            <label>Street / Flat / Area Address</label>
                                            <input 
                                                type="text" 
                                                placeholder="House No, Street Name, Landmark" 
                                                value={newAddr.address} 
                                                onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="auth-grid-2">
                                            <div className="auth-field">
                                                <label>Pincode (Auto Lookup)</label>
                                                <input 
                                                    type="text" 
                                                    maxLength="6" 
                                                    placeholder="800001" 
                                                    value={newAddr.pincode} 
                                                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div className="auth-field">
                                                <label>City / District</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Patna" 
                                                    value={newAddr.city} 
                                                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="auth-field">
                                            <label>Contact Mobile Number</label>
                                            <input 
                                                type="text" 
                                                placeholder="9876543210" 
                                                value={newAddr.mobile} 
                                                onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })} 
                                            />
                                        </div>
                                        <button type="submit" className="save-addr-submit-btn">
                                            <FaCheck /> Save Address
                                        </button>
                                    </form>
                                )}

                                {/* Saved Addresses Radio/Tick Selection List */}
                                <div className="addresses-list">
                                    {savedAddresses.length === 0 ? (
                                        <div className="pane-empty">
                                            <div className="empty-icon">📍</div>
                                            <h5>No saved addresses yet</h5>
                                            <p>Add a new address to speed up your checkout process.</p>
                                        </div>
                                    ) : (
                                        savedAddresses.map((addr) => {
                                            const isSelected = activeAddressId === addr.id;
                                            return (
                                                <div 
                                                    key={addr.id} 
                                                    className={`address-card-item ${isSelected ? 'selected-active' : ''}`}
                                                    onClick={() => handleSelectAddress(addr.id)}
                                                >
                                                    <div className="address-card-radio">
                                                        <div className={`radio-outer ${isSelected ? 'checked' : ''}`}>
                                                            {isSelected && <div className="radio-inner" />}
                                                        </div>
                                                    </div>
                                                    <div className="address-card-body">
                                                        <div className="address-tag-row">
                                                            <span className="address-title-tag">{addr.title || 'Shipping Address'}</span>
                                                            {isSelected && (
                                                                <span className="active-tick-pill">
                                                                    <FaCheck /> Active Shipping Address
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="address-text-line">{addr.address}</p>
                                                        <p className="address-city-line">{addr.city} — PIN {addr.pincode}</p>
                                                        {addr.mobile && <p className="address-mobile-line"><FaPhone /> {addr.mobile}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── ACCOUNT DETAILS TAB ───────────────────── */}
                        {activeTab === 'profile' && (
                            <div className="tab-pane">
                                <div className="pane-title-row">
                                    <h4>Account Profile & Details</h4>
                                    {!editMode ? (
                                        <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                                            <FaEdit /> Edit Profile
                                        </button>
                                    ) : (
                                        <button className="edit-profile-btn cancel-btn" onClick={() => setEditMode(false)}>
                                            <FaTimes /> Cancel
                                        </button>
                                    )}
                                </div>

                                {profileMsg.text && (
                                    <div className={`auth-alert-v2 ${profileMsg.type}`} style={{ marginBottom: '12px' }}>
                                        {profileMsg.text}
                                    </div>
                                )}

                                {!editMode ? (
                                    <div className="profile-details-grid">
                                        <div className="profile-detail-card">
                                            <span className="detail-label">Full Name</span>
                                            <span className="detail-value">{user.name} {profile?.surname || ''}</span>
                                        </div>
                                        <div className="profile-detail-card">
                                            <span className="detail-label">Email Address</span>
                                            <span className="detail-value">{user.email}</span>
                                        </div>
                                        <div className="profile-detail-card">
                                            <span className="detail-label">Mobile Number</span>
                                            <span className="detail-value">{profile?.mobile || 'Not set'}</span>
                                        </div>
                                        <div className="profile-detail-card">
                                            <span className="detail-label">Gender</span>
                                            <span className="detail-value">{profile?.gender || 'Male'}</span>
                                        </div>
                                        <div className="profile-detail-card">
                                            <span className="detail-label">Account Role</span>
                                            <span className="detail-value text-accent">{user.role?.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleProfileUpdateSubmit} className="edit-profile-form">
                                        <div className="auth-grid-2">
                                            <div className="auth-field">
                                                <label>First Name</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.name} 
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div className="auth-field">
                                                <label>Surname</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.surname} 
                                                    onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="auth-grid-2">
                                            <div className="auth-field">
                                                <label>Mobile Number</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.mobile} 
                                                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div className="auth-field">
                                                <label>Gender</label>
                                                <select 
                                                    value={profileForm.gender} 
                                                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" className="save-addr-submit-btn">
                                            <FaCheck /> Update Details
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* ─── SETTINGS TAB ──────────────────────────── */}
                        {activeTab === 'settings' && (
                            <div className="tab-pane">
                                <h4>Account Settings</h4>
                                <div className="settings-list">
                                    <div className="setting-item">
                                        <div>
                                            <h6>Order Notifications</h6>
                                            <p>Receive order updates via SMS and WhatsApp</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.notifications} 
                                            onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} 
                                            className="toggle-checkbox"
                                        />
                                    </div>
                                    <div className="setting-item">
                                        <div>
                                            <h6>Promotional Offers</h6>
                                            <p>Get exclusive coupons and discount codes for SoleStreet Patna</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.emailOffers} 
                                            onChange={(e) => setSettings({ ...settings, emailOffers: e.target.checked })} 
                                            className="toggle-checkbox"
                                        />
                                    </div>
                                    <div className="setting-item">
                                        <div>
                                            <h6>Dark Mode Interface</h6>
                                            <p>Enable luxury dark theme across application</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.darkMode} 
                                            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })} 
                                            className="toggle-checkbox"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── HELP CENTER TAB ───────────────────────── */}
                        {activeTab === 'help' && (
                            <div className="tab-pane">
                                <h4>Help Center & Customer Care</h4>
                                
                                <div className="help-contact-cards">
                                    <div className="help-card">
                                        <FaPhone className="help-card-icon" />
                                        <h6>Customer Hotline</h6>
                                        <p>+91 98765 43210</p>
                                        <span className="help-sub">Mon-Sat (10:00 AM - 7:00 PM)</span>
                                    </div>
                                    <div className="help-card">
                                        <FaEnvelope className="help-card-icon" />
                                        <h6>Email Support</h6>
                                        <p>support@solestreet.com</p>
                                        <span className="help-sub">24/7 Fast response</span>
                                    </div>
                                </div>

                                <div className="faq-section">
                                    <h5>Frequently Asked Questions</h5>
                                    {faqs.map((faq, idx) => (
                                        <div key={idx} className="faq-item">
                                            <div 
                                                className="faq-question" 
                                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                            >
                                                <span>{faq.q}</span>
                                                <FaChevronDown className={`faq-chevron ${openFaq === idx ? 'rotated' : ''}`} />
                                            </div>
                                            {openFaq === idx && (
                                                <div className="faq-answer">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfileModal;
