import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const search = searchParams.get('search') || '';
                let url = `/products?search=${search}`;
                const { data } = await API.get(url);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchParams]);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <h2 className="page-title">All Products</h2>
            {products.length === 0 ? (
                <p className="no-products">No products found.</p>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;
