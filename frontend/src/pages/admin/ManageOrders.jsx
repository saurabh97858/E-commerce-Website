import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');

    const fetchOrders = async () => {
        let url = '/orders/all';
        if (filterStatus) url += `?status=${filterStatus}`;
        const { data } = await API.get(url);
        setOrders(data);
    };

    useEffect(() => { fetchOrders(); }, [filterStatus]);

    const updateStatus = async (id, status) => {
        await API.put(`/orders/${id}/status`, { status });
        fetchOrders();
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Manage Orders</h2>
            <div className="filter-bar">
                <label>Filter: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <table className="data-table">
                <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id.slice(-8).toUpperCase()}</td>
                            <td>{order.user?.name} ({order.user?.email})</td>
                            <td>{order.items.map((item, i) => <div key={i}>{item.name} x{item.quantity}</div>)}</td>
                            <td>₹{order.totalAmount}</td>
                            <td><span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageOrders;
