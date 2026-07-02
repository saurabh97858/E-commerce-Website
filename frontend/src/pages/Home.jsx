import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';

// ─── Main Home Page ─────────────────────────────────────────────────
const Home = () => {
    const [products, setProducts] = useState(() => {
        try {
            const cached = localStorage.getItem('cached_home_products');
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });
    const [categories, setCategories] = useState(() => {
        try {
            const cached = localStorage.getItem('cached_home_categories');
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(() => {
        try {
            const cached = localStorage.getItem('cached_home_products');
            return cached && JSON.parse(cached).length > 0 ? false : true;
        } catch {
            return true;
        }
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/categories');
                setCategories(data);
                localStorage.setItem('cached_home_categories', JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = useCallback(async (pageNum, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else if (products.length === 0) setLoading(true);

            const search = searchParams.get('search') || '';
            const category = searchParams.get('category') || '';
            const minPrice = searchParams.get('minPrice') || '';
            const maxPrice = searchParams.get('maxPrice') || '';
            const size = searchParams.get('size') || '';
            const sort = searchParams.get('sort') || '';
            const inStock = searchParams.get('inStock') === 'true';
            const rating = searchParams.get('rating') || '';

            let url = `/products?page=${pageNum}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (category) url += `&category=${category}`;
            if (minPrice) url += `&minPrice=${minPrice}`;
            if (maxPrice) url += `&maxPrice=${maxPrice}`;
            if (size) url += `&size=${size}`;

            const { data } = await API.get(url);

            // Apply frontend filters & sorting
            let processed = [...data];
            
            if (inStock) {
                processed = processed.filter(p => p.stock > 0);
            }
            
            if (rating) {
                processed = processed.filter(p => (p.rating || 0) >= Number(rating));
            }

            if (sort === 'price_asc') {
                processed.sort((a, b) => a.price - b.price);
            } else if (sort === 'price_desc') {
                processed.sort((a, b) => b.price - a.price);
            } else if (sort === 'rating') {
                processed.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }

            if (isLoadMore) {
                setProducts(prev => [...prev, ...processed]);
            } else {
                setProducts(processed);
                localStorage.setItem('cached_home_products', JSON.stringify(processed));
            }

            setHasMore(data.length === 10);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchParams]);

    useEffect(() => {
        setPage(1);
        fetchProducts(1, false);
    }, [fetchProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    const activeSearch = searchParams.get('search');
    const activeCategory = searchParams.get('category');
    const hasFilters = activeSearch || 
                       activeCategory || 
                       searchParams.get('minPrice') || 
                       searchParams.get('maxPrice') || 
                       searchParams.get('size') || 
                       searchParams.get('inStock') || 
                       searchParams.get('rating') || 
                       searchParams.get('sort');

    return (
        <div className="main-layout">
            <div className="content-area" style={{ width: '100%' }}>
                {/* Promo Marquee Bar */}
                <div className="marquee-bar" aria-label="Promotions">
                    <div className="marquee-inner">
                        ⚡ <strong>Exclusive Offer:</strong> Free shipping on orders above ₹1000! &nbsp;·&nbsp;
                        Use code <strong>SOLESTREET</strong> for 15% off everything &nbsp;·&nbsp;
                        Use code <strong>SHOE20</strong> for 20% off all footwear &nbsp;·&nbsp;
                        Use code <strong>SNEAKER10</strong> for 10% off premium sneakers &nbsp;·&nbsp;
                        🎉 SoleStreet Patna Deals — <strong>BOOTS25</strong> saves 25% on leather boots &nbsp;·&nbsp;
                        ⭐ Trusted by 10,000+ Patna shoe lovers &nbsp;·&nbsp;
                        ⚡ <strong>Exclusive Offer:</strong> Free shipping on orders above ₹1000! &nbsp;·&nbsp;
                        Use code <strong>SOLESTREET</strong> for 15% off everything &nbsp;·&nbsp;
                        Use code <strong>COMFY15</strong> for 15% off comfortable daily wear sandals
                    </div>
                </div>

                {/* Auto-Rotating Hero Carousel */}
                <HeroCarousel />

                {/* Section Header */}
                <div className="section-header">
                    <h2 className="section-title">
                        {activeSearch
                            ? `Results for "${activeSearch}"`
                            : activeCategory
                            ? 'Category Products'
                            : 'Our Collection'}
                    </h2>
                    {!loading && (
                        <span className="section-count">
                            {products.length} product{products.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="products-loading">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="product-card-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-info">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="no-products">
                        <div className="no-products-icon">🛍️</div>
                        <h3>No products found</h3>
                        <p>Try a different search or browse all categories.</p>
                    </div>
                ) : (
                    <>
                        <div className="product-grid">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="load-more-container">
                                <button
                                    onClick={handleLoadMore}
                                    className="load-more-btn"
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <><span className="btn-spinner"></span> Loading...</>
                                    ) : (
                                        'Load More Products'
                                    )}
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
