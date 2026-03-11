import { Link } from 'react-router-dom';
import API from '../api/axios';

const ProductCard = ({ product }) => {
    // Helper to get image src
    const getImageSrc = (img) => {
        if (!img || typeof img !== 'string' || img.trim() === '') {
            return '/placeholder.png'; // Assuming there's a local placeholder or just fallback naturally
        }
        if (img.startsWith('http') || img.startsWith('data:')) {
            return img;
        }
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
        return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-image-link">
                <div className="product-card-image">
                    <img
                        src={getImageSrc(product.images?.[0])}
                        alt={product.name}
                        className="product-image"
                    />
                </div>
            </Link>
            <div className="product-card-info">
                <p className="product-card-name">Name : {product.name}</p>
                <p className="product-card-price">
                    Price : {product.price} &nbsp;
                    <Link to={`/product/${product._id}`} className="view-link">View..</Link>
                </p>
            </div>
        </div>
    );
};

export default ProductCard;
