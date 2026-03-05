import { useState, useEffect } from 'react';
import API from '../api/axios';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/my-orders');
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <h2 className="page-title">My Orders</h2>
            {orders.length === 0 ? (
                <p className="no-products">No orders found.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id.slice(-8).toUpperCase()}</td>
                                <td>
                                    {order.items.map((item, i) => (
                                        <div key={i}>{item.name} x{item.quantity}</div>
                                    ))}
                                </td>
                                <td>₹{order.totalAmount}</td>
                                <td>
                                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyOrders;
