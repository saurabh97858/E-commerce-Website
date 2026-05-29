import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaTachometerAlt, FaUsers, FaBox, FaClipboardList, FaCreditCard,
    FaComments, FaChartBar, FaShieldAlt, FaArrowRight, FaTags
} from 'react-icons/fa';

const AdminPanel = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const adminSections = [
        {
            title: 'Dashboard',
            description: 'Store overview, sales stats, revenue charts and daily analytics',
            icon: <FaTachometerAlt />,
            path: '/admin/dashboard',
            color: '#e94560',
            gradient: 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(233,69,96,0.05))',
            badge: null,
        },
        {
            title: 'Categories',
            description: 'Create, edit and delete product categories for your store',
            icon: <FaTags />,
            path: '/admin/categories',
            color: '#0066cc',
            gradient: 'linear-gradient(135deg, rgba(0,102,204,0.2), rgba(0,102,204,0.05))',
            badge: null,
        },
        {
            title: 'Products',
            description: 'Manage your entire product catalog — add, edit, delete listings',
            icon: <FaBox />,
            path: '/admin/products',
            color: '#f5a623',
            gradient: 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.05))',
            badge: null,
        },
        {
            title: 'Orders',
            description: 'View and manage all customer orders, update statuses',
            icon: <FaClipboardList />,
            path: '/admin/orders',
            color: '#2ecc71',
            gradient: 'linear-gradient(135deg, rgba(46,204,113,0.2), rgba(46,204,113,0.05))',
            badge: 'Live',
        },
        {
            title: 'Payments',
            description: 'Review payment records and transaction history',
            icon: <FaCreditCard />,
            path: '/admin/payments',
            color: '#9b59b6',
            gradient: 'linear-gradient(135deg, rgba(155,89,182,0.2), rgba(155,89,182,0.05))',
            badge: null,
        },
        {
            title: 'Feedback',
            description: 'Read and manage customer feedback and product reviews',
            icon: <FaComments />,
            path: '/admin/feedback',
            color: '#1abc9c',
            gradient: 'linear-gradient(135deg, rgba(26,188,156,0.2), rgba(26,188,156,0.05))',
            badge: null,
        },
        {
            title: 'Reports',
            description: 'Category-wise sales reports and inventory analytics',
            icon: <FaChartBar />,
            path: '/admin/reports',
            color: '#e67e22',
            gradient: 'linear-gradient(135deg, rgba(230,126,34,0.2), rgba(230,126,34,0.05))',
            badge: null,
        },
    ];

    if (user?.role === 'super_admin') {
        adminSections.push({
            title: 'Manage Admins',
            description: 'Create, edit and remove admin accounts (Super Admin only)',
            icon: <FaShieldAlt />,
            path: '/super-admin/manage-admins',
            color: '#e94560',
            gradient: 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(233,69,96,0.05))',
            badge: 'Super Admin',
        });
    }

    return (
        <div className="admin-panel-page">
            <div className="admin-panel-hero">
                <div className="admin-panel-hero-inner">
                    <div className="admin-panel-hero-icon">
                        <FaShieldAlt />
                    </div>
                    <div>
                        <h1 className="admin-panel-title">Admin Control Panel</h1>
                        <p className="admin-panel-subtitle">
                            Welcome back, <strong>{user?.name}</strong>! Manage your SoleStreet Patna store from here.
                        </p>
                    </div>
                </div>
            </div>

            <div className="admin-sections-grid">
                {adminSections.map((section) => (
                    <button
                        key={section.path}
                        className="admin-section-card"
                        onClick={() => navigate(section.path)}
                        style={{ background: section.gradient, borderColor: `${section.color}33` }}
                    >
                        <div className="admin-section-card-header">
                            <div className="admin-section-icon" style={{ color: section.color, background: `${section.color}22` }}>
                                {section.icon}
                            </div>
                            {section.badge && (
                                <span className="admin-section-badge" style={{ background: `${section.color}33`, color: section.color }}>
                                    {section.badge}
                                </span>
                            )}
                        </div>
                        <h3 className="admin-section-title" style={{ color: section.color }}>{section.title}</h3>
                        <p className="admin-section-desc">{section.description}</p>
                        <div className="admin-section-arrow" style={{ color: section.color }}>
                            Go to {section.title} <FaArrowRight />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;
