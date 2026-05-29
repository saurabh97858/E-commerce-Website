import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaCreditCard, FaRupeeSign, FaUser, FaBuilding, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ManagePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { data } = await API.get('/payments/all');
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaCreditCard className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Manage Payments</h1>
                        <p className="pro-page-subtitle">Track financial transactions and payment receipts</p>
                    </div>
                </div>
            </div>

            <div className="cart-summary-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    Payment History ({payments.length} transactions)
                </h3>

                {loading ? (
                    <div className="loading" style={{ padding: '40px 0' }}>Loading transaction records...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Customer</th>
                                    <th>Method</th>
                                    <th>Bank</th>
                                    <th>Card / Details</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No transaction records found.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p) => (
                                        <tr key={p._id}>
                                            <td><strong style={{ fontFamily: 'monospace', color: 'white' }}>#{p._id.slice(-8).toUpperCase()}</strong></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FaUser style={{ color: 'var(--text-muted)', fontSize: '11px' }} />
                                                    <div>
                                                        <div style={{ color: 'white', fontWeight: '500' }}>{p.user?.name || 'Guest User'}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.user?.email || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: '600' }}>{p.paymentType}</td>
                                            <td>
                                                {p.bankName ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                                        <FaBuilding style={{ color: 'var(--text-muted)', fontSize: '11px' }} />
                                                        <span>{p.bankName}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                {p.cardNumberLast4 ? (
                                                    <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        •••• {p.cardNumberLast4}
                                                    </code>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <strong style={{ color: 'var(--accent)', fontSize: '15px' }}>₹{p.amount}</strong>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${p.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    {p.status.toLowerCase() === 'success' ? <FaCheckCircle style={{ fontSize: '10px' }} /> : <FaExclamationCircle style={{ fontSize: '10px' }} />}
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePayments;
