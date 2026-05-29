import { useState, useEffect } from 'react';
import API from '../api/axios';
import { FaBox, FaCalendarAlt, FaRupeeSign, FaMapMarkerAlt, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaShippingFast, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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

const OrderCard = ({ order }) => {
    const [expanded, setExpanded] = useState(false);

    const placedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const estimatedDate = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        : new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 7))
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const statusColorMap = {
        'Pending': 'var(--warning)',
        'Shipped': '#3b82f6',
        'Out for Delivery': '#8b5cf6',
        'Delivered': 'var(--success)',
        'Cancelled': 'var(--danger)'
    };

    return (
        <div className="order-card-premium">
            {/* Card Header */}
            <div className="order-card-premium-header">
                <div className="order-info-group">
                    <span className="order-id-tag">
                        ORDER #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <div className="order-meta-row">
                        <span className="order-meta-item">
                            <FaCalendarAlt /> Placed on {placedDate}
                        </span>
                        <span className="order-meta-item">
                            <FaRupeeSign /> Total: <strong style={{ color: 'var(--accent)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                        </span>
                        <span className="order-meta-item">
                            <FaTruck /> Est. Delivery: <strong style={{ color: 'var(--success)' }}>{estimatedDate}</strong>
                        </span>
                    </div>
                </div>
                <div className="order-card-right">
                    <span className="order-status-pill" style={{ background: `${statusColorMap[order.status]}22`, color: statusColorMap[order.status], borderColor: `${statusColorMap[order.status]}44` }}>
                        {order.status === 'Pending' && <FaClock />}
                        {order.status === 'Shipped' && <FaShippingFast />}
                        {order.status === 'Out for Delivery' && <FaTruck />}
                        {order.status === 'Delivered' && <FaCheckCircle />}
                        {order.status === 'Cancelled' && <FaTimesCircle />}
                        {order.status}
                    </span>
                    <button
                        className="order-expand-btn"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <FaChevronUp /> : <FaChevronDown />}
                        {expanded ? 'Less' : 'Details'}
                    </button>
                </div>
            </div>

            {/* Items preview (always visible) */}
            <div className="order-items-preview">
                {order.items.slice(0, expanded ? order.items.length : 2).map((item, i) => (
                    <div key={i} className="order-item-card">
                        {item.image ? (
                            <img src={item.image} alt={item.name} className="order-item-thumb" />
                        ) : (
                            <div className="order-item-thumb-placeholder">
                                <FaBox />
                            </div>
                        )}
                        <div className="order-item-info">
                            <span className="order-item-name">{item.name}</span>
                            <div className="order-item-meta">
                                {item.size && <span className="order-item-badge">Size: {item.size}</span>}
                                <span className="order-item-badge">Qty: ×{item.quantity}</span>
                                <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {!expanded && order.items.length > 2 && (
                    <div className="order-items-more" onClick={() => setExpanded(true)}>
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''} — click Details to view all
                    </div>
                )}
            </div>

            {/* Expanded section */}
            {expanded && (
                <div className="order-expanded-section">
                    {/* Status Tracker */}
                    <div className="order-section-block">
                        <h4 className="order-section-label">Order Progress</h4>
                        <StatusTracker status={order.status} />
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="order-section-block">
                            <h4 className="order-section-label">
                                <FaMapMarkerAlt style={{ color: 'var(--primary)' }} /> Shipping Address
                            </h4>
                            <div className="order-address-box">
                                {order.shippingAddress.address && <p>{order.shippingAddress.address}</p>}
                                {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
                                {order.shippingAddress.pincode && <p>PIN: {order.shippingAddress.pincode}</p>}
                            </div>
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="order-section-block">
                        <h4 className="order-section-label">Price Breakdown</h4>
                        <div className="order-price-table">
                            {order.items.map((item, i) => (
                                <div key={i} className="order-price-row">
                                    <span>{item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                            <div className="order-price-divider" />
                            <div className="order-price-row total-row">
                                <span>Total Amount</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/my-orders');
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="pro-page">
            <div className="loading">Loading your orders...</div>
        </div>
    );

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaBox className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">My Orders</h1>
                        <p className="pro-page-subtitle">
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                        </p>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="no-products" style={{ marginTop: '40px' }}>
                    <div className="no-products-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
