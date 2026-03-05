import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaUsers, FaBox, FaShoppingBag, FaTags, FaRupeeSign, FaClock, FaTruck } from 'react-icons/fa';

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="loading">Loading...</div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, color: '#008000' },
        { label: 'Total Products', value: stats.totalProducts, icon: <FaBox />, color: '#0066cc' },
        { label: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingBag />, color: '#cc6600' },
        { label: 'Categories', value: stats.totalCategories, icon: <FaTags />, color: '#660099' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <FaRupeeSign />, color: '#008000' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: <FaClock />, color: '#cc0000' },
        { label: 'Delivered Orders', value: stats.deliveredOrders, icon: <FaTruck />, color: '#008000' },
    ];

    return (
        <div className="page-container">
            <h2 className="page-title">Admin Dashboard</h2>
            <div className="dashboard-grid">
                {cards.map((card, idx) => (
                    <div key={idx} className="dashboard-card" style={{ borderLeftColor: card.color }}>
                        <div className="dashboard-card-icon" style={{ color: card.color }}>{card.icon}</div>
                        <div className="dashboard-card-info">
                            <h3>{card.value}</h3>
                            <p>{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
