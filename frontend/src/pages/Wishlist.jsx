import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';

const Wishlist = () => {
    const { wishlist } = useAuth();

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaHeart className="pro-page-icon" style={{ color: 'var(--primary)' }} />
                    <div>
                        <h1 className="pro-page-title">My Wishlist</h1>
                        <p className="pro-page-subtitle">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
                    </div>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="empty-inline">
                    <FaHeart className="empty-inline-icon" style={{ color: 'var(--primary)' }} />
                    <p>Your wishlist is empty. Explore our collection to add your favorite shoes!</p>
                    <Link to="/products" className="btn-primary-lg" style={{ marginTop: '16px' }}>
                        <FaShoppingBag /> Browse Products
                    </Link>
                </div>
            ) : (
                <div className="product-grid">
                    {wishlist.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
