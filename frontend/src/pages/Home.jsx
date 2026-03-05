import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const search = searchParams.get('search') || '';
                const category = searchParams.get('category') || '';
                let url = '/products?';
                if (search) url += `search=${search}&`;
                if (category) url += `category=${category}&`;
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

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <div className="marquee-bar">
                    <marquee>Welcome to SHOES Shopping — Best quality shoes at affordable prices! Free shipping on orders above ₹1000!</marquee>
                </div>
                {loading ? (
                    <div className="loading">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="no-products">No products found.</div>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
