import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaHome } from 'react-icons/fa';

const OrderSuccess = () => {
    return (
        <div className="order-success-page-compact">
            <div className="order-success-card-compact">
                <div className="success-check-circle">
                    <FaCheckCircle />
                </div>
                <h2 className="success-compact-title">Order Placed Successfully!</h2>
                <p className="success-compact-text">
                    Thank you for your purchase from SoleStreet Patna. Your order is being processed and will be delivered soon!
                </p>
                <div className="success-compact-actions">
                    <Link to="/my-orders" className="btn-primary-compact">
                        <FaBox /> View My Orders
                    </Link>
                    <Link to="/" className="btn-outline-compact">
                        <FaHome /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
