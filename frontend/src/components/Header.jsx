import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

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
            <div className="header-top">
                <Link to="/" className="logo">
                    <img src="/shoe-logo.png" alt="Shoes" style={{ height: 30, marginRight: 8 }} onError={(e) => e.target.style.display = 'none'} />
                    <span className="logo-text">SHOES</span>
                    <span className="logo-sub">Shopping</span>
                </Link>
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn"><FaSearch /> SEARCH</button>
                </form>
                {user && (
                    <div className="welcome-text">
                        welcome {user.name} {user.surname}
                        <button onClick={handleLogout} className="logout-btn">LogOut</button>
                    </div>
                )}
            </div>
            <nav className="nav-bar">
                <Link to="/" className="nav-link">HOME</Link>
                {!user ? (
                    <>
                        <Link to="/products" className="nav-link">PRODUCT</Link>
                        <Link to="/feedback" className="nav-link">FEEDBACK</Link>
                        <Link to="/register" className="nav-link">SIGN UP</Link>
                        <Link to="/login" className="nav-link">LOGIN</Link>
                        <Link to="/contact" className="nav-link">CONTACT US</Link>
                    </>
                ) : user.role === 'admin' ? (
                    <>
                        <Link to="/admin/dashboard" className="nav-link">DASHBOARD</Link>
                        <Link to="/admin/categories" className="nav-link">CATEGORIES</Link>
                        <Link to="/admin/products" className="nav-link">PRODUCTS</Link>
                        <Link to="/admin/orders" className="nav-link">ORDERS</Link>
                        <Link to="/admin/payments" className="nav-link">PAYMENTS</Link>
                        <Link to="/admin/feedback" className="nav-link">FEEDBACK</Link>
                        <Link to="/admin/reports" className="nav-link">REPORTS</Link>
                    </>
                ) : (
                    <>
                        <Link to="/my-account" className="nav-link">MY ACCOUNT</Link>
                        <Link to="/my-orders" className="nav-link">MY ORDER</Link>
                        <Link to="/my-payments" className="nav-link">MY PAYMENT</Link>
                        <Link to="/cart" className="nav-link">
                            MY CART <FaShoppingCart /> {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                        </Link>
                        <Link to="/change-password" className="nav-link">CHANGE PASSWORD</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
