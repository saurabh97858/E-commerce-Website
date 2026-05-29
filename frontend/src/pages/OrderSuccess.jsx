import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaHome } from 'react-icons/fa';

const OrderSuccess = () => {
    return (
        <div className="empty-state-page">
            <div className="empty-state-card success-state">
                <div className="success-check-icon">
                    <FaCheckCircle />
                </div>
                <h2 className="empty-state-title" style={{ color: 'var(--success)' }}>Order Placed Successfully!</h2>
                <p className="empty-state-text">Thank you for your purchase. Your order is being processed and you'll receive a confirmation soon.</p>
                <div className="success-actions">
                    <Link to="/my-orders" className="btn-primary-lg">
                        <FaBox /> View My Orders
                    </Link>
                    <Link to="/" className="btn-outline-lg">
                        <FaHome /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
