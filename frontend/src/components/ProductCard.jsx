import { Link } from 'react-router-dom';
import API from '../api'; // Assuming API is imported from a file like this

const ProductCard = ({ product }) => {
    // Helper to get image src
    const getImageSrc = (img) => {
        if (!img) return 'https://via.placeholder.com/300';
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        // Assuming API.defaults.baseURL is something like 'http://localhost:5000/api'
        // and we want to prepend 'http://localhost:5000' for relative paths.
        return `${API.defaults.baseURL.replace('/api', '')}${img}`;
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-image-link">
                <img
                    src={getImageSrc(product.images?.[0])}
                    alt={product.name}
                    className="product-image"
                />
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
