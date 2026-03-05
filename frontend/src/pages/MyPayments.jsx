import { useState, useEffect } from 'react';
import API from '../api/axios';

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
        <div className="page-container">
            <h2 className="page-title">My Payments</h2>
            {payments.length === 0 ? (
                <p className="no-products">No payments found.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Payment Type</th>
                            <th>Bank</th>
                            <th>Card (Last 4)</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p._id}>
                                <td>{p._id.slice(-8).toUpperCase()}</td>
                                <td>{p.paymentType}</td>
                                <td>{p.bankName}</td>
                                <td>****{p.cardNumberLast4}</td>
                                <td>₹{p.amount}</td>
                                <td><span className={`status-badge status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyPayments;
