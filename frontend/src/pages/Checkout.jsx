import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';

const Checkout = () => {
    const { cart, fetchCart } = useCart();
    const navigate = useNavigate();
    const [payment, setPayment] = useState({
        paymentType: 'Credit Card', bankName: '', branch: '', cardNumber: '', cvv: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const total = cart.items
        ? cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
        : 0;

    const handleChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Place order first
            const { data: order } = await API.post('/orders/place', {});
            // Process payment
            await API.post('/payments/process', {
                orderId: order._id,
                paymentType: payment.paymentType,
                bankName: payment.bankName,
                branch: payment.branch,
                cardNumber: payment.cardNumber,
                amount: total
            });
            await fetchCart();
            navigate('/order-success');
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="page-container">
                <h2 className="page-title">Checkout</h2>
                <p className="no-products">Your cart is empty. <button onClick={() => navigate('/')} className="btn-green">Shop Now</button></p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title">Payment Details</h2>
            {error && <div className="error-msg">{error}</div>}
            <div className="checkout-layout">
                <div className="checkout-summary">
                    <h3>Order Summary</h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                        </thead>
                        <tbody>
                            {cart.items.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.product?.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{(item.product?.price || 0) * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="cart-total"><strong>Total: ₹{total}</strong></p>
                </div>
                <div className="payment-form-container">
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Payment Type</label>
                            <select name="paymentType" value={payment.paymentType} onChange={handleChange}>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                                <option value="Net Banking">Net Banking</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input type="text" name="bankName" value={payment.bankName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Branch</label>
                            <input type="text" name="branch" value={payment.branch} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Card Number (16 digits)</label>
                            <input type="text" name="cardNumber" maxLength="16" value={payment.cardNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>CVV</label>
                            <input type="text" name="cvv" maxLength="3" value={payment.cvv} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn-green" disabled={loading}>
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
