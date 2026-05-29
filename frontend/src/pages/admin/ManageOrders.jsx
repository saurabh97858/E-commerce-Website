import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaClipboardList, FaFilter } from 'react-icons/fa';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let url = '/orders/all';
            if (filterStatus) url += `?status=${filterStatus}`;
            const { data } = await API.get(url);
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [filterStatus]);

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
            alert(err.response?.data?.message || 'Failed to update status.');
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;
    if (error) return <div className="pro-page"><div className="error-msg">{error}</div></div>;

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaClipboardList className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Manage Orders</h1>
                        <p className="pro-page-subtitle">{orders.length} orders total</p>
                    </div>
                </div>
                <div className="filter-bar">
                    <FaFilter style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td><strong>#{order._id.slice(-8).toUpperCase()}</strong></td>
                                <td>
                                    <div>{order.user?.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                                </td>
                                <td>{order.items.map((item, i) => <div key={i} style={{ fontSize: '13px' }}>{item.name} ×{item.quantity}</div>)}</td>
                                <td><strong style={{ color: 'var(--accent)' }}>₹{order.totalAmount}</strong></td>
                                <td><span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span></td>
                                <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageOrders;
