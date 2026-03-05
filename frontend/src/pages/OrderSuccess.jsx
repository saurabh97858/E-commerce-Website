import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccess = () => {
    return (
        <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
            <FaCheckCircle size={80} color="#008000" />
            <h2 style={{ color: '#008000', marginTop: 20 }}>Thank You!</h2>
            <p style={{ fontSize: 18, marginTop: 10 }}>Your order has been placed successfully.</p>
            <div style={{ marginTop: 30, display: 'flex', gap: 15, justifyContent: 'center' }}>
                <Link to="/my-orders" className="btn-green">View My Orders</Link>
                <Link to="/" className="btn-green">Continue Shopping</Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
