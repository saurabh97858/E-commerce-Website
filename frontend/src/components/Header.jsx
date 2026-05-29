import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { FaShoppingCart, FaSearch, FaHeart, FaUser, FaChevronDown, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [navOpen, setNavOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?search=${search}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            {/* Top Bar: Logo + Search + Actions */}
            <div className="header-inner">
                <div className="header-top">
                    <Link to="/" className="logo">
                        <img src="/smartshop-logo.png" alt="SoleStreet Patna" style={{ height: 32, marginRight: 8 }} onError={(e) => e.target.style.display = 'none'} />
                        <div className="logo-text-wrapper">
                            <span className="logo-text">SOLESTREET</span>
                            <span className="logo-sub">Patna</span>
                        </div>
                    </Link>
                    <form className="search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search for premium shoes, sneakers, formal boots..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-btn"><FaSearch /> SEARCH</button>
                    </form>
                    
                    <div className="header-actions">
                        <Link to="/wishlist" className="header-action-link" title="Wishlist">
                            <FaHeart className="action-icon heart-icon-nav" />
                            <span className="action-text">Wishlist</span>
                        </Link>
                        
                        <Link to="/cart" className="header-action-link cart-btn" title="Cart">
                            <div className="cart-icon-wrapper">
                                <FaShoppingCart className="action-icon" />
                                {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                            </div>
                            <span className="action-text">Cart</span>
                        </Link>

                        {!user ? (
                            <div className="auth-buttons">
                                <Link to="/login" className="auth-link login-link">Login</Link>
                                <Link to="/login?tab=register" className="auth-link signup-link">Sign Up</Link>
                            </div>
                        ) : (
                            <div 
                                className="user-profile-menu"
                                onMouseEnter={() => setProfileOpen(true)}
                                onMouseLeave={() => setProfileOpen(false)}
                            >
                                <div 
                                    className="profile-trigger"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                >
                                    <div className="profile-avatar">
                                        <FaUser />
                                    </div>
                                    <span className="profile-name">Hi, {user.name.split(' ')[0]}</span>
                                    <FaChevronDown className={`chevron-icon${profileOpen ? ' chevron-rotated' : ''}`} />
                                </div>
                                <div className={`profile-dropdown${profileOpen ? ' dropdown-visible' : ''}`}>
                                    <div className="dropdown-header">
                                        <p className="dropdown-user-name">{user.name}</p>
                                        <p className="dropdown-user-email">{user.email}</p>
                                        <span className="user-role-badge">{user.role.replace('_', ' ')}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    
                                    {/* User Specific Links */}
                                    {(user.role === 'admin' || user.role === 'super_admin') ? (
                                        <>
                                            <Link to="/admin" className="dropdown-item" onClick={() => setProfileOpen(false)}>Admin Panel</Link>
                                            <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setProfileOpen(false)}>Dashboard</Link>
                                            {user.role === 'super_admin' && (
                                                <Link to="/super-admin/manage-admins" className="dropdown-item" onClick={() => setProfileOpen(false)}>Manage Admins</Link>
                                            )}
                                            <Link to="/admin/categories" className="dropdown-item" onClick={() => setProfileOpen(false)}>Categories</Link>
                                            <Link to="/admin/products" className="dropdown-item" onClick={() => setProfileOpen(false)}>Products</Link>
                                            <Link to="/admin/orders" className="dropdown-item" onClick={() => setProfileOpen(false)}>Orders</Link>
                                            <Link to="/admin/payments" className="dropdown-item" onClick={() => setProfileOpen(false)}>Payments</Link>
                                            <Link to="/admin/feedback" className="dropdown-item" onClick={() => setProfileOpen(false)}>Feedback</Link>
                                            <Link to="/admin/reports" className="dropdown-item" onClick={() => setProfileOpen(false)}>Reports</Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/my-account" className="dropdown-item" onClick={() => setProfileOpen(false)}>My Profile</Link>
                                            <Link to="/my-orders" className="dropdown-item" onClick={() => setProfileOpen(false)}>My Orders</Link>
                                            <Link to="/my-payments" className="dropdown-item" onClick={() => setProfileOpen(false)}>My Payments</Link>
                                            <Link to="/wishlist" className="dropdown-item" onClick={() => setProfileOpen(false)}>Wishlist</Link>
                                        </>
                                    )}
                                    <Link to="/change-password" className="dropdown-item" onClick={() => setProfileOpen(false)}>Change Password</Link>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={() => { handleLogout(); setProfileOpen(false); }} className="dropdown-item logout-action">
                                        <FaSignOutAlt className="logout-icon" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
 
            {/* Navigation Bar: centered links */}
            <div className="nav-bar-wrapper">
                <button className="nav-hamburger" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
                    {navOpen ? <FaTimes /> : <FaBars />}
                </button>
                <nav className={`nav-bar ${navOpen ? 'nav-open' : ''}`}>
                    <NavLink to="/" className="nav-link" end onClick={() => setNavOpen(false)}>Home</NavLink>
                    <NavLink to="/products" className="nav-link" onClick={() => setNavOpen(false)}>Products</NavLink>
                    <NavLink to="/feedback" className="nav-link" onClick={() => setNavOpen(false)}>Feedback</NavLink>
                    <NavLink to="/contact" className="nav-link" onClick={() => setNavOpen(false)}>Contact Us</NavLink>
                    
                    {user && (user.role === 'admin' || user.role === 'super_admin') && (
                        <>
                            <span className="nav-divider">|</span>
                            <NavLink to="/admin" className="nav-link nav-link-admin-highlight" onClick={() => setNavOpen(false)}>
                                <span className="admin-badge-dot"></span> Admin Panel
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
