import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await API.get(`/products/${id}`);
                setProduct(data);
                if (data.sizes && data.sizes.length > 0) {
                    setSize(data.sizes[0]);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await addToCart(product._id, quantity, size);
            setMessage('Item added to cart!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to add to cart');
        }
    };

    const getImageSrc = (img) => {
        if (!img) return 'https://via.placeholder.com/400x400?text=No+Image';
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        return `${API.defaults.baseURL.replace('/api', '')}${img}`;
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!product) return <div className="loading">Product not found</div>;

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-images">
                    <div className="main-image">
                        <img
                            src={getImageSrc(product.images?.[selectedImage])}
                            alt={product.name}
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="thumbnail-list">
                            {product.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={getImageSrc(img)}
                                    alt={`${product.name} ${idx + 1}`}
                                    className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(idx)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="product-info">
                    <h2>{product.name}</h2>
                    <p className="product-price">Price: ₹{product.price}</p>
                    <p className="product-category">Category: {product.category?.name || 'N/A'}</p>
                    <p className="product-stock">Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
                    <div className="product-options">
                        <div className="form-group">
                            <label>Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                            />
                        </div>
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="form-group">
                                <label>Size:</label>
                                <select value={size} onChange={(e) => setSize(e.target.value)}>
                                    {product.sizes.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <button onClick={handleAddToCart} className="btn-green" disabled={product.stock === 0}>
                        Add to Cart
                    </button>
                    {message && <div className="success-msg">{message}</div>}
                    {product.description && (
                        <div className="product-specs">
                            <h3>Item Specs</h3>
                            <p>{product.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
