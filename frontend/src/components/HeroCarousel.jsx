import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// ─── Hero Banner Data ───────────────────────────────────────────────
export const BANNERS = [
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

export const HeroCarousel = () => {
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
            {/* Glow accent */}
            <div
                className="hero-carousel-glow"
                style={{
                    background: `radial-gradient(circle at 80% 50%, ${banner.glowColor} 0%, transparent 50%)`
                }}
            />

            {/* Slider Content */}
            <div className="hero-carousel-content">
                <div className="hero-left">
                    <span className="hero-tag" style={{ color: banner.accentColor }}>{banner.tag}</span>
                    <h1 className="hero-title">{banner.title}</h1>
                    <p className="hero-subtitle">{banner.subtitle}</p>

                    <div className="hero-cta-row">
                        <button
                            className="hero-cta-btn"
                            style={{
                                background: banner.accentColor,
                                boxShadow: `0 4px 15px ${banner.glowColor}`
                            }}
                            onClick={() => navigate('/')}
                        >
                            {banner.cta} →
                        </button>
                        <div className="hero-code-box">
                            <span className="hero-code-desc">{banner.codeDesc}</span>
                            <span className="hero-code" style={{ borderColor: `${banner.accentColor}88` }}>{banner.code}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="hero-emoji-display" style={{ background: `${banner.accentColor}15` }}>
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
