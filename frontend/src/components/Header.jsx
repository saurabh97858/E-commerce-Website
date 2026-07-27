import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaHeart, FaUser, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import API from '../api/axios';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeCategory = searchParams.get('category') || '';
    const activeSearch = searchParams.get('search') || '';

    const [search, setSearch] = useState('');
    const [navOpen, setNavOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Modal state
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authInitialTab, setAuthInitialTab] = useState('login');
    const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Debounced search suggestion fetcher
    useEffect(() => {
        if (search.trim().length < 2) {
            setSuggestions({ products: [], categories: [] });
            return;
        }
        const delayDebounce = setTimeout(async () => {
            try {
                const { data } = await API.get(`/products?search=${search}&limit=5`);
                const matchedCats = categories.filter(c => 
                    c.name.toLowerCase().includes(search.toLowerCase())
                );
                
                setSuggestions({
                    products: data.products || [],
                    categories: matchedCats
                });
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            }
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [search, categories]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?search=${search}`);
    };

    const openLoginModal = (tab = 'login') => {
        setAuthInitialTab(tab);
        setAuthModalOpen(true);
        setNavOpen(false);
    };

    return (
        <>
            <header className="header">
                {/* Top Bar: Logo + Search + Actions */}
                <div className="header-inner">
                    <div className="header-top">
                        {/* 3-Line Hamburger Menu Icon for Mobile */}
                        <button className="nav-hamburger" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation menu">
                            {navOpen ? <FaTimes /> : <FaBars />}
                        </button>

                        <Link to="/" className="logo">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, filter: 'drop-shadow(0 0 6px var(--primary))' }}>
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <div className="logo-text-wrapper">
                                <span className="logo-text">SOLESTREET</span>
                                <span className="logo-sub">Patna</span>
                            </div>
                        </Link>

                        {/* Search Bar */}
                        <form className="search-form" onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search for products, brands, categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                                className="search-input"
                            />
                            <button type="submit" className="search-btn"><FaSearch /> SEARCH</button>
                            
                            {/* Auto-suggestions Dropdown */}
                            {showSuggestions && search.trim().length >= 2 && (suggestions.products?.length > 0 || suggestions.categories?.length > 0) && (
                                <div className="search-suggestions-dropdown" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    width: '100%',
                                    background: 'rgba(18, 18, 26, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    marginTop: '8px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                                    zIndex: 9999,
                                    overflow: 'hidden',
                                    textAlign: 'left'
                                }}>
                                    {/* Categories Suggestions */}
                                    {suggestions.categories?.length > 0 && (
                                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Categories</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                                {suggestions.categories.map(cat => (
                                                    <Link 
                                                        key={cat._id}
                                                        to={`/?category=${cat._id}`} 
                                                        onClick={() => { setShowSuggestions(false); setSearch(''); }}
                                                        style={{
                                                            fontSize: '11px',
                                                            background: 'rgba(255, 255, 255, 0.04)',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            border: '1px solid var(--border)',
                                                            color: 'var(--text-primary)',
                                                            textDecoration: 'none',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Products Suggestions */}
                                    {suggestions.products?.length > 0 && (
                                        <div style={{ padding: '8px 12px' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matching Items</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                                                {suggestions.products.map(prod => {
                                                    const prodImg = (() => {
                                                        const img = prod.images?.[0];
                                                        const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2316162a'/%3E%3Ctext x='50%25' y='55%25' font-family='Arial' font-size='16' fill='%23e94560' text-anchor='middle'%3E👟%3C/text%3E%3C/svg%3E";
                                                        if (!img || typeof img !== 'string' || img.trim() === '') return placeholder;
                                                        if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                        let path = img;
                                                        if (!path.startsWith('/uploads/') && !path.startsWith('uploads/')) {
                                                            path = '/uploads/' + (path.startsWith('/') ? path.slice(1) : path);
                                                        } else if (path.startsWith('uploads/')) {
                                                            path = '/' + path;
                                                        }
                                                        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                                        return `${baseUrl}${path}`;
                                                    })();
                                                    return (
                                                        <Link 
                                                            key={prod._id} 
                                                            to={`/product/${prod._id}`}
                                                            onClick={() => { setShowSuggestions(false); setSearch(''); }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                textDecoration: 'none',
                                                                padding: '6px',
                                                                borderRadius: 'var(--radius-sm)',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <img 
                                                                src={prodImg} 
                                                                alt={prod.name} 
                                                                style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} 
                                                            />
                                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</span>
                                                                <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '700' }}>₹{prod.price?.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                        
                        {/* Header Action Buttons on Right */}
                        <div className="header-actions">
                            <Link to="/wishlist" className="header-action-link" title="Wishlist">
                                <FaHeart className="action-icon heart-icon-nav" />
                                <span className="action-text">Wishlist</span>
                            </Link>
                            
                            {/* Cart Button */}
                            <Link to="/cart" className="header-action-link cart-btn" title="Cart">
                                <div className="cart-icon-wrapper">
                                    <FaShoppingCart className="action-icon" />
                                    {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                                </div>
                                <span className="action-text">Cart</span>
                            </Link>

                            {!user ? (
                                <div className="auth-buttons">
                                    <button 
                                        type="button" 
                                        className="auth-link login-link header-single-login-btn"
                                        onClick={() => openLoginModal('login')}
                                    >
                                        <FaUser className="login-btn-icon" /> Login
                                    </button>
                                </div>
                            ) : (
                                <div className="user-profile-menu">
                                    <div 
                                        className="profile-trigger"
                                        onClick={() => setUserProfileModalOpen(true)}
                                        title="User Profile & Account"
                                    >
                                        <div className="profile-avatar">
                                            {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                                        </div>
                                        <span className="profile-name">Hi, {user.name.split(' ')[0]}</span>
                                        <FaChevronDown className="chevron-icon" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
     
                {/* Mobile Navigation Backdrop Overlay */}
                <div 
                    className={`nav-backdrop ${navOpen ? 'active' : ''}`} 
                    onClick={() => setNavOpen(false)} 
                    aria-hidden="true"
                />

                {/* Navigation Bar (Desktop horizontal & Mobile Drawer) */}
                <div className={`nav-bar-wrapper ${navOpen ? 'mobile-nav-active' : ''}`}>
                    <nav className={`nav-bar ${navOpen ? 'nav-open' : ''}`}>
                        {/* Only visible in mobile view */}
                        <div className="mobile-nav-header">
                            <span className="mobile-nav-title">Menu Navigation</span>
                            <button className="mobile-nav-close" onClick={() => setNavOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <Link to="/" className={`nav-link${location.pathname === '/' && !activeCategory && !activeSearch ? ' active' : ''}`} onClick={() => setNavOpen(false)}>Home</Link>
                        <Link to="/products" className={`nav-link${location.pathname === '/products' ? ' active' : ''}`} onClick={() => setNavOpen(false)}>Products</Link>

                        {categories.map((cat) => {
                            const isCatActive = location.pathname === '/' && activeCategory === cat._id;
                            return (
                                <Link
                                    key={cat._id}
                                    to={`/?category=${cat._id}`}
                                    className={`nav-link${isCatActive ? ' active' : ''}`}
                                    onClick={() => setNavOpen(false)}
                                >
                                    {cat.name}
                                </Link>
                            );
                        })}

                        <Link to="/contact" className={`nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => setNavOpen(false)}>Contact Us</Link>
                        
                        {user && (user.role === 'admin' || user.role === 'super_admin') && (
                            <>
                                <span className="nav-divider">|</span>
                                <Link to="/admin" className="nav-link nav-link-admin-highlight" onClick={() => setNavOpen(false)}>
                                    <span className="admin-badge-dot"></span> Admin Panel
                                </Link>
                            </>
                        )}

                        {/* Only visible in mobile view */}
                        <div className="mobile-nav-quick-actions">
                            {!user ? (
                                <button className="mobile-login-btn" onClick={() => openLoginModal('login')}>
                                    <FaUser /> Sign In / Create Account
                                </button>
                            ) : (
                                <button className="mobile-profile-btn" onClick={() => { setNavOpen(false); setUserProfileModalOpen(true); }}>
                                    <FaUser /> Account, Orders & Addresses
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {/* Auth Modal (Sign In / Create Account Popup) */}
            <AuthModal 
                isOpen={authModalOpen} 
                onClose={() => setAuthModalOpen(false)} 
                initialTab={authInitialTab}
            />

            {/* User Profile Modal Drawer */}
            <UserProfileModal 
                isOpen={userProfileModalOpen} 
                onClose={() => setUserProfileModalOpen(false)}
                onSwitchAccount={() => openLoginModal('login')}
            />
        </>
    );
};

export default Header;
