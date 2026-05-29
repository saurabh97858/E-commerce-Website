import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaStar, FaRegStar, FaCheck, FaSlidersH } from 'react-icons/fa';

const Sidebar = () => {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    const activeCategory = searchParams.get('category') || '';
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '10000');
    const [size, setSize] = useState(searchParams.get('size') || '');
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [rating, setRating] = useState(searchParams.get('rating') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Sync filter states when URL params change (e.g., reset from outside)
    useEffect(() => {
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '10000');
        setSize(searchParams.get('size') || '');
        setInStock(searchParams.get('inStock') === 'true');
        setRating(searchParams.get('rating') || '');
        setSort(searchParams.get('sort') || '');
    }, [searchParams]);

    const getTargetPath = () =>
        window.location.pathname.startsWith('/products') ? '/products' : '/';

    const handleCategoryClick = (categoryId) => {
        const params = new URLSearchParams(searchParams);
        if (categoryId) params.set('category', categoryId);
        else params.delete('category');
        params.set('page', '1');
        navigate(`${getTargetPath()}?${params.toString()}`);
        setIsMobileOpen(false);
    };

    const handleApplyFilters = (e) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
        if (maxPrice && maxPrice !== '10000') params.set('maxPrice', maxPrice); else params.delete('maxPrice');
        if (size) params.set('size', size); else params.delete('size');
        if (inStock) params.set('inStock', 'true'); else params.delete('inStock');
        if (rating) params.set('rating', rating); else params.delete('rating');
        if (sort) params.set('sort', sort); else params.delete('sort');
        params.set('page', '1');
        navigate(`${getTargetPath()}?${params.toString()}`);
        setIsMobileOpen(false);
    };

    const handleClearFilters = () => {
        const params = new URLSearchParams();
        const search = searchParams.get('search');
        if (search) params.set('search', search);
        setMaxPrice('10000');
        setMinPrice('');
        setSize('');
        setInStock(false);
        setRating('');
        setSort('');
        navigate(`${getTargetPath()}?${params.toString()}`);
    };

    const handleSortChange = (newSort) => {
        setSort(newSort);
        const params = new URLSearchParams(searchParams);
        if (newSort) params.set('sort', newSort); else params.delete('sort');
        params.set('page', '1');
        navigate(`${getTargetPath()}?${params.toString()}`);
    };

    const handleStockToggle = (checked) => {
        setInStock(checked);
        const params = new URLSearchParams(searchParams);
        if (checked) params.set('inStock', 'true'); else params.delete('inStock');
        params.set('page', '1');
        navigate(`${getTargetPath()}?${params.toString()}`);
    };

    const handleRatingClick = (rVal) => {
        const nextVal = rating === String(rVal) ? '' : String(rVal);
        setRating(nextVal);
        const params = new URLSearchParams(searchParams);
        if (nextVal) params.set('rating', nextVal); else params.delete('rating');
        params.set('page', '1');
        navigate(`${getTargetPath()}?${params.toString()}`);
    };

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar-collapsed', String(next));
            return next;
        });
    };

    const activeFilterCount = [
        searchParams.get('category'),
        searchParams.get('minPrice'),
        searchParams.get('maxPrice'),
        searchParams.get('size'),
        searchParams.get('inStock') === 'true' ? 'true' : '',
        searchParams.get('rating'),
        searchParams.get('sort'),
    ].filter(Boolean).length;

    return (
        <>
            {/* ─── Desktop: Floating Trigger Button (shown only when collapsed) ─── */}
            {isCollapsed && (
                <button
                    className="sidebar-floating-trigger-btn"
                    onClick={toggleCollapse}
                    aria-label="Open filters sidebar"
                    title="Open Filters"
                >
                    <FaSlidersH className="floating-trigger-icon" />
                    <span className="floating-trigger-text">FILTERS</span>
                    {activeFilterCount > 0 && (
                        <span className="floating-trigger-badge">{activeFilterCount}</span>
                    )}
                    <FaChevronRight className="floating-trigger-chevron" />
                </button>
            )}

            {/* ─── Mobile: Floating FAB Button ─── */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open filters"
            >
                <FaFilter />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="mobile-filter-badge">{activeFilterCount}</span>
                )}
            </button>

            {/* ─── Mobile: Overlay backdrop ─── */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ─── Sidebar Panel ─── */}
            <aside
                className={`sidebar${isMobileOpen ? ' sidebar-open' : ''}${isCollapsed ? ' sidebar-collapsed' : ''}`}
                aria-label="Filters and Categories"
            >
                {/* ── Header ── */}
                <div className="sidebar-header">
                    <div className="sidebar-title">
                        <FaSlidersH className="sidebar-title-icon" />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="sidebar-active-badge">{activeFilterCount}</span>
                        )}
                    </div>

                    {/* Desktop collapse button */}
                    <button
                        type="button"
                        className="sidebar-desktop-collapse-btn"
                        onClick={toggleCollapse}
                        title="Collapse Sidebar"
                        aria-label="Collapse Sidebar"
                    >
                        <FaChevronLeft />
                    </button>

                    {/* Mobile close button */}
                    <button
                        type="button"
                        className="sidebar-close-btn"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close filters"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* ── Scrollable Content ── */}
                <div className="sidebar-scrollable-content">

                    {/* CATEGORIES */}
                    <div className="sidebar-section-label">Categories</div>
                    <ul className="sidebar-list">
                        <li
                            className={`sidebar-item${!activeCategory ? ' active' : ''}`}
                            onClick={() => handleCategoryClick('')}
                        >
                            All Products
                        </li>
                        {categories.map((cat) => (
                            <li
                                key={cat._id}
                                className={`sidebar-item${activeCategory === cat._id ? ' active' : ''}`}
                                onClick={() => handleCategoryClick(cat._id)}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>

                    <div className="sidebar-divider" />

                    {/* SORT BY */}
                    <div className="sidebar-section-label">Sort By</div>
                    <div className="sidebar-section-body">
                        <div className="sort-pills">
                            {[
                                { value: '', label: 'Default' },
                                { value: 'price_asc', label: '↑ Price' },
                                { value: 'price_desc', label: '↓ Price' },
                                { value: 'rating', label: '⭐ Rating' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`sort-pill${sort === opt.value ? ' active' : ''}`}
                                    onClick={() => handleSortChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-divider" />

                    {/* MAX PRICE SLIDER */}
                    <div className="sidebar-section-label">
                        Max Price
                        <span className="filter-val-badge">₹{Number(maxPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="sidebar-section-body">
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            onMouseUp={handleApplyFilters}
                            onTouchEnd={handleApplyFilters}
                            className="filter-range-slider"
                            aria-label="Maximum price"
                        />
                        <div className="slider-limits">
                            <span>₹0</span>
                            <span>₹10,000</span>
                        </div>

                        {/* Custom number inputs */}
                        <div className="price-inputs-row">
                            <input
                                type="number"
                                placeholder="Min ₹"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="price-number-input"
                                aria-label="Minimum price"
                            />
                            <span className="price-to-dash">—</span>
                            <input
                                type="number"
                                placeholder="Max ₹"
                                value={maxPrice === '10000' ? '' : maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value || '10000')}
                                className="price-number-input"
                                aria-label="Maximum price"
                            />
                        </div>
                    </div>

                    <div className="sidebar-divider" />

                    {/* SIZE SELECTOR */}
                    <div className="sidebar-section-label">Size / Variant</div>
                    <div className="sidebar-section-body">
                        <div className="size-chips">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11'].map((sz) => (
                                <button
                                    key={sz}
                                    type="button"
                                    className={`size-chip${size === sz ? ' active' : ''}`}
                                    onClick={() => {
                                        const next = size === sz ? '' : sz;
                                        setSize(next);
                                        const params = new URLSearchParams(searchParams);
                                        if (next) params.set('size', next); else params.delete('size');
                                        params.set('page', '1');
                                        navigate(`${getTargetPath()}?${params.toString()}`);
                                    }}
                                >
                                    {sz}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-divider" />

                    {/* IN STOCK TOGGLE */}
                    <div className="sidebar-section-body">
                        <div className="toggle-row">
                            <span className="toggle-label">In Stock Only</span>
                            <label className="ios-switch" aria-label="In stock only">
                                <input
                                    type="checkbox"
                                    checked={inStock}
                                    onChange={(e) => handleStockToggle(e.target.checked)}
                                />
                                <span className={`ios-switch-slider${inStock ? ' on' : ''}`}>
                                    <span className="ios-switch-knob" />
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="sidebar-divider" />

                    {/* STAR RATING */}
                    <div className="sidebar-section-label">Customer Rating</div>
                    <div className="sidebar-section-body">
                        <div className="rating-selector-list">
                            {[4, 3, 2].map((stars) => (
                                <button
                                    key={stars}
                                    type="button"
                                    onClick={() => handleRatingClick(stars)}
                                    className={`rating-selector-btn${rating === String(stars) ? ' active' : ''}`}
                                    aria-label={`${stars} stars and up`}
                                >
                                    <div className="rating-stars-row">
                                        {[1, 2, 3, 4, 5].map((s) =>
                                            s <= stars
                                                ? <FaStar key={s} className="star-icon filled" />
                                                : <FaRegStar key={s} className="star-icon empty" />
                                        )}
                                    </div>
                                    <span className="rating-selector-text">&amp; Up</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Sticky Footer Actions ── */}
                <div className="sidebar-footer">
                    <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="filter-apply-btn"
                    >
                        <FaCheck className="btn-icon" /> Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="filter-reset-btn"
                    >
                        Reset
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
