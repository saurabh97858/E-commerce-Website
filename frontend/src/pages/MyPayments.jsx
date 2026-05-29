import { useState, useEffect } from 'react';
import API from '../api/axios';
import { FaWallet, FaCreditCard, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { data } = await API.get('/payments/my-payments');
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaWallet className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">My Payments</h1>
                        <p className="pro-page-subtitle">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="empty-inline">
                    <FaWallet className="empty-inline-icon" />
                    <p>No payment records found.</p>
                </div>
            ) : (
                <div className="order-cards">
                    {payments.map((p) => (
                        <div className="order-card" key={p._id}>
                            <div className="order-card-header">
                                <div className="order-id">
                                    <span className="order-id-label">Payment</span>
                                    <span className="order-id-value">#{p._id.slice(-8).toUpperCase()}</span>
                                </div>
                                <span className={`status-badge status-${p.status.toLowerCase()}`}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="payment-card-body">
                                <div className="payment-detail-row">
                                    <FaCreditCard className="payment-detail-icon" />
                                    <div>
                                        <span className="payment-detail-label">Method</span>
                                        <span className="payment-detail-value">{p.paymentType}</span>
                                    </div>
                                </div>
                                <div className="payment-detail-row">
                                    <FaWallet className="payment-detail-icon" />
                                    <div>
                                        <span className="payment-detail-label">Bank</span>
                                        <span className="payment-detail-value">{p.bankName} {p.branch ? `(${p.branch})` : ''}</span>
                                    </div>
                                </div>
                                <div className="payment-detail-row">
                                    <FaCreditCard className="payment-detail-icon" />
                                    <div>
                                        <span className="payment-detail-label">Card</span>
                                        <span className="payment-detail-value">•••• •••• •••• {p.cardNumberLast4}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-card-footer">
                                <div className="order-meta">
                                    <FaCalendarAlt /> {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                                <div className="order-amount">
                                    <FaRupeeSign /> {p.amount}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPayments;
