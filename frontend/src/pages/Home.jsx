import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// ─── Hero Banner Data ───────────────────────────────────────────────
const BANNERS = [
    {
        id: 1,
        tag: '🔥 GRAND OPENING',
        title: 'SOLESTREET PATNA LAUNCH',
        subtitle: 'Bihar\'s premier premium footwear store is now online! Grab the finest designer mojaris, sneakers, and formal shoes at up to 50% OFF.',
        cta: 'Shop Launch Deals',
        code: 'SOLESTREET',
        codeDesc: '15% OFF everything',
        bg: 'linear-gradient(135deg, #1d1b26 0%, #2d1329 60%, #1d1b26 100%)',
        accentColor: '#e94560',
        glowColor: 'rgba(233,69,96,0.25)',
        emoji: '👟',
    },
    {
        id: 2,
        tag: '👟 FOOTWEAR SPECIAL',
        title: 'STEAL DEAL ON KICKS!',
        subtitle: 'Get flat 20% OFF on all premium designer mojaris, sports shoes, and ladies heels. Elevate your style game today!',
        cta: 'Shop Footwear',
        code: 'SHOE20',
        codeDesc: '20% OFF footwear',
        bg: 'linear-gradient(135deg, #1b262c 0%, #0f4c81 60%, #1b262c 100%)',
        accentColor: '#3b82f6',
        glowColor: 'rgba(59,130,246,0.25)',
        emoji: '👟',
    },
    {
        id: 3,
        tag: '🔥 URBAN VIBES',
        title: 'PATNA SNEAKERHEADS',
        subtitle: 'Explore the hottest sneaker drops at SoleStreet Patna. Limited stock available—don\'t miss out on the perfect pair.',
        cta: 'Explore Collection',
        code: 'PATNA20',
        codeDesc: '20% OFF selected',
        bg: 'linear-gradient(135deg, #0f1923 0%, #1a2f1f 60%, #0f1923 100%)',
        accentColor: '#2ecc71',
        glowColor: 'rgba(46,204,113,0.25)',
        emoji: '🔥',
    },
    {
        id: 4,
        tag: '👗 STYLE ESSENTIALS',
        title: 'UPGRADE YOUR STRIDE',
        subtitle: 'From street-ready sneakers to classy formal shoes, find your perfect match at SoleStreet Patna. Quality you can trust.',
        cta: 'Shop Now',
        code: 'STREET10',
        codeDesc: '10% OFF orders',
        bg: 'linear-gradient(135deg, #1f0f2a 0%, #2a1a3e 60%, #1f0f2a 100%)',
        accentColor: '#9b59b6',
        glowColor: 'rgba(155,89,182,0.25)',
        emoji: '✨',
    },
    {
        id: 5,
        tag: '🏠 LOCAL FAVORITES',
        title: 'SOLESTREET BESTSELLERS',
        subtitle: 'The top-rated picks from our Patna showroom, delivered straight to your door. Trendy, comfortable, and affordable.',
        cta: 'Browse Best',
        code: 'LOCAL15',
        codeDesc: '15% OFF items',
        bg: 'linear-gradient(135deg, #1a1f0f 0%, #2a3a1a 60%, #1a1f0f 100%)',
        accentColor: '#f5a623',
        glowColor: 'rgba(245,166,35,0.25)',
        emoji: '🏠',
    },
];

// ─── Hero Carousel ─────────────────────────────────────────────────
const HeroCarousel = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), []);
    const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), []);

    // Auto-rotate every 4 seconds
    useEffect(() => {
        timerRef.current = setInterval(next, 4000);
        return () => clearInterval(timerRef.current);
    }, [next]);

    const pauseAndGo = (fn) => {
        clearInterval(timerRef.current);
        fn();
        timerRef.current = setInterval(next, 4000);
    };

    const banner = BANNERS[current];

    return (
        <div className="hero-carousel" style={{ background: banner.bg }}>
            {/* Glow decoration */}
            <div className="hero-carousel-glow" style={{ background: `radial-gradient(circle, ${banner.glowColor} 0%, transparent 70%)` }} />

            {/* Content */}
            <div className="hero-carousel-content">
                <div className="hero-left">
                    <span className="hero-tag" style={{ color: banner.accentColor }}>
                        {banner.tag}
                    </span>
                    <h2 className="hero-title" style={{ color: '#fff' }}>
                        {banner.title}
                    </h2>
                    <p className="hero-subtitle">{banner.subtitle}</p>
                    <div className="hero-cta-row">
                        <button
                            className="hero-cta-btn"
                            style={{
                                background: `linear-gradient(135deg, ${banner.accentColor}, ${banner.accentColor}cc)`,
                                boxShadow: `0 4px 20px ${banner.glowColor}`
                            }}
                            onClick={() => navigate('/products')}
                        >
                            {banner.cta} →
                        </button>
                        <div className="hero-code-box">
                            <span className="hero-code-desc">{banner.codeDesc}</span>
                            <span className="hero-code" style={{ color: banner.accentColor }}>
                                {banner.code}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="hero-right">
                    <div className="hero-emoji-display" style={{ color: banner.accentColor }}>
                        <span className="hero-big-emoji">{banner.emoji}</span>
                    </div>
                </div>
            </div>

            {/* Prev / Next arrows */}
            <button className="hero-arrow hero-arrow-left" onClick={() => pauseAndGo(prev)}>
                <FaChevronLeft />
            </button>
            <button className="hero-arrow hero-arrow-right" onClick={() => pauseAndGo(next)}>
                <FaChevronRight />
            </button>

            {/* Dot indicators */}
            <div className="hero-dots">
                {BANNERS.map((_, i) => (
                    <button
                        key={i}
                        className={`hero-dot ${i === current ? 'active' : ''}`}
                        style={i === current ? { background: banner.accentColor } : {}}
                        onClick={() => pauseAndGo(() => setCurrent(i))}
                    />
                ))}
            </div>

            {/* Progress bar */}
            <div className="hero-progress" style={{ background: `${banner.accentColor}44` }}>
                <div
                    key={current}
                    className="hero-progress-fill"
                    style={{ background: banner.accentColor }}
                />
            </div>
        </div>
    );
};

// ─── Main Home Page ─────────────────────────────────────────────────
const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchProducts = useCallback(async (pageNum, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const search = searchParams.get('search') || '';
            const category = searchParams.get('category') || '';
            const minPrice = searchParams.get('minPrice') || '';
            const maxPrice = searchParams.get('maxPrice') || '';
            const size = searchParams.get('size') || '';
            const sort = searchParams.get('sort') || '';
            const inStock = searchParams.get('inStock') === 'true';
            const rating = searchParams.get('rating') || '';

            let url = `/products?page=${pageNum}&limit=12`;
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
            }

            setHasMore(data.length === 12);
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
            <Sidebar />
            <div className="content-area">
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

                {/* Auto-Rotating Hero Carousel (only when not filtering) */}
                {!hasFilters && <HeroCarousel />}

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
