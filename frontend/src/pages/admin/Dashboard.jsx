import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaTachometerAlt, FaUsers, FaBox, FaShoppingBag, FaTags, FaRupeeSign, FaClock, FaTruck } from 'react-icons/fa';
import DashboardCharts from '../../components/admin/DashboardCharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, reportsRes] = await Promise.all([
                    API.get('/admin/dashboard'),
                    API.get('/admin/reports')
                ]);
                setStats(statsRes.data);
                setReports(reportsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setError(error.response?.data?.message || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="pro-page"><div className="error-msg">{error}</div></div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, color: 'var(--primary)' },
        { label: 'Total Products', value: stats.totalProducts, icon: <FaBox />, color: '#0066cc' },
        { label: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingBag />, color: 'var(--accent)' },
        { label: 'Categories', value: stats.totalCategories, icon: <FaTags />, color: '#660099' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <FaRupeeSign />, color: 'var(--success)' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: <FaClock />, color: 'var(--warning)' },
        { label: 'Delivered Orders', value: stats.deliveredOrders, icon: <FaTruck />, color: 'var(--success)' },
    ];

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaTachometerAlt className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Admin Dashboard</h1>
                        <p className="pro-page-subtitle">Overview of your store performance</p>
                    </div>
                </div>
            </div>
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

            {/* Dashboard Visual Charts */}
            <DashboardCharts dailySales={stats.dailySales} categoryReports={reports} />
        </div>
    );
};

export default Dashboard;
