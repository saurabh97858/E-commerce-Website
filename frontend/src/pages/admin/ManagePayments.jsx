import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManagePayments = () => {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            const { data } = await API.get('/payments/all');
            setPayments(data);
        };
        fetchPayments();
    }, []);

    return (
        <div className="page-container">
            <h2 className="page-title">All Payments</h2>
            <table className="data-table">
                <thead>
                    <tr><th>ID</th><th>Customer</th><th>Type</th><th>Bank</th><th>Card</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                    {payments.map((p) => (
                        <tr key={p._id}>
                            <td>{p._id.slice(-8).toUpperCase()}</td>
                            <td>{p.user?.name} ({p.user?.email})</td>
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
        </div>
    );
};

export default ManagePayments;
