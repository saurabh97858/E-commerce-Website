import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = async (pageNum, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const search = searchParams.get('search') || '';
            const category = searchParams.get('category') || '';
            let url = `/products?page=${pageNum}&limit=12&`;
            if (search) url += `search=${search}&`;
            if (category) url += `category=${category}&`;
            
            const { data } = await API.get(url);
            
            if (isLoadMore) {
                setProducts(prev => [...prev, ...data]);
            } else {
                setProducts(data);
            }
            
            // If we got fewer products than the limit, there are no more
            if (data.length < 12) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchProducts(1, false);
    }, [searchParams]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

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
                    <>
                        <div className="product-grid">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="load-more-container" style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                                <button 
                                    onClick={handleLoadMore} 
                                    className="load-more-btn" 
                                    disabled={loadingMore}
                                    style={{ 
                                        padding: '12px 30px', 
                                        background: '#333', 
                                        color: 'white', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        borderRadius: '4px',
                                        opacity: loadingMore ? 0.7 : 1
                                    }}
                                >
                                    {loadingMore ? 'Loading...' : 'LOAD MORE PRODUCTS'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
