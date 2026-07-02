import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { FaSearch, FaSort, FaTimes } from 'react-icons/fa';
import { HeroCarousel } from '../components/HeroCarousel';

const SORT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [localSearch, setLocalSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync sorting with URL query parameters for dynamic, synced control
    const sort = searchParams.get('sort') || '';
    const setSort = (newSort) => {
        const params = new URLSearchParams(searchParams);
        if (newSort) params.set('sort', newSort);
        else params.delete('sort');
        params.set('page', '1');
        setSearchParams(params);
    };

    const fetchProducts = useCallback(async (pageNum, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const search = searchParams.get('search') || '';
            const category = searchParams.get('category') || '';
            const minPrice = searchParams.get('minPrice') || '';
            const maxPrice = searchParams.get('maxPrice') || '';
            const size = searchParams.get('size') || '';
            const inStock = searchParams.get('inStock') === 'true';
            const ratingFilter = searchParams.get('rating') || '';

            let url = `/products?page=${pageNum}&limit=12`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (category) url += `&category=${category}`;
            if (minPrice) url += `&minPrice=${minPrice}`;
            if (maxPrice) url += `&maxPrice=${maxPrice}`;
            if (size) url += `&size=${size}`;

            const { data } = await API.get(url);

            // Apply frontend filtering & sorting
            let processed = [...data];
            
            if (inStock) {
                processed = processed.filter(p => p.stock > 0);
            }
            
            if (ratingFilter) {
                processed = processed.filter(p => (p.rating || 0) >= Number(ratingFilter));
            }

            if (sort === 'price_asc') processed.sort((a, b) => a.price - b.price);
            if (sort === 'price_desc') processed.sort((a, b) => b.price - a.price);
            if (sort === 'rating') processed.sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
    }, [searchParams, sort]);

    useEffect(() => {
        setPage(1);
        setLocalSearch(searchParams.get('search') || '');
        fetchProducts(1, false);
    }, [fetchProducts]); // fetchProducts changes whenever searchParams or sort changes

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (localSearch.trim()) {
            params.set('search', localSearch.trim());
        } else {
            params.delete('search');
        }
        setSearchParams(params);
    };

    const clearSearch = () => {
        setLocalSearch('');
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        setSearchParams(params);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    const activeSearch = searchParams.get('search');
    const hasFilters = activeSearch || 
                       searchParams.get('category') || 
                       searchParams.get('minPrice') || 
                       searchParams.get('maxPrice') || 
                       searchParams.get('size') || 
                       searchParams.get('inStock') || 
                       searchParams.get('rating');

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                {/* Section Header */}
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 className="section-title" style={{ margin: 0 }}>
                            {activeSearch ? `Search Results: "${activeSearch}"` : 'All Products'}
                        </h2>
                        {!loading && (
                            <span className="section-count" style={{
                                fontSize: '11.5px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)'
                            }}>
                                {products.length} product{products.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    
                    <div className="products-sort-wrapper" style={{ margin: 0 }}>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="products-sort-select"
                            aria-label="Sort products"
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Filter Chips */}
                {hasFilters && (
                    <div className="filter-chips">
                        {activeSearch && (
                            <span className="filter-chip">
                                Search: {activeSearch}
                                <button onClick={clearSearch} aria-label="Remove search filter">
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        {searchParams.get('category') && (
                            <span className="filter-chip">
                                Category filter active
                                <button
                                    onClick={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('category');
                                        setSearchParams(p);
                                    }}
                                    aria-label="Remove category filter"
                                >
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        {searchParams.get('minPrice') && (
                            <span className="filter-chip">
                                Price &ge; ₹{searchParams.get('minPrice')}
                                <button
                                    onClick={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('minPrice');
                                        setSearchParams(p);
                                    }}
                                    aria-label="Remove min price filter"
                                >
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        {searchParams.get('maxPrice') && (
                            <span className="filter-chip">
                                Price &le; ₹{searchParams.get('maxPrice')}
                                <button
                                    onClick={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('maxPrice');
                                        setSearchParams(p);
                                    }}
                                    aria-label="Remove max price filter"
                                >
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        {searchParams.get('size') && (
                            <span className="filter-chip">
                                Size: {searchParams.get('size')}
                                <button
                                    onClick={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('size');
                                        setSearchParams(p);
                                    }}
                                    aria-label="Remove size filter"
                                >
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        {searchParams.get('inStock') === 'true' && (
                            <span className="filter-chip">
                                In Stock Only
                                <button
                                    onClick={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('inStock');
                                        setSearchParams(p);
                                    }}
                                    aria-label="Remove in stock filter"
                                >
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        {searchParams.get('rating') && (
                            <span className="filter-chip">
                                Rating: {searchParams.get('rating')}+ Stars
                                <button
                                    onClick={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('rating');
                                        setSearchParams(p);
                                    }}
                                    aria-label="Remove rating filter"
                                >
                                    <FaTimes />
                                </button>
                            </span>
                        )}
                        <button
                            className="clear-all-filters"
                            onClick={() => {
                                setSearchParams({});
                                setLocalSearch('');
                            }}
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="products-loading">
                        {Array.from({ length: 12 }).map((_, i) => (
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
                        <div className="no-products-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                        <button
                            className="btn-primary-sm"
                            onClick={() => {
                                setSearchParams({});
                                setLocalSearch('');
                            }}
                        >
                            Browse All Products
                        </button>
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

export default Products;
