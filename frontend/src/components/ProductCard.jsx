import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const imageUrl = product.images && product.images.length > 0
        ? `http://localhost:5000${product.images[0]}`
        : 'https://via.placeholder.com/200x200?text=No+Image';

    return (
        <div className="product-card">
            <div className="product-card-image">
                <img src={imageUrl} alt={product.name} />
            </div>
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
