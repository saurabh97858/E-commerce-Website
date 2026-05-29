import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaCommentDots, FaUser, FaEnvelope, FaCalendarAlt, FaMeh, FaSmile, FaFrown, FaSlidersH } from 'react-icons/fa';

const ManageFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sentimentFilter, setSentimentFilter] = useState('all');

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/feedback');
            setFeedbacks(data);
            setFilteredFeedbacks(data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Handle filter application
    useEffect(() => {
        if (sentimentFilter === 'all') {
            setFilteredFeedbacks(feedbacks);
        } else {
            setFilteredFeedbacks(feedbacks.filter(f => f.sentiment === sentimentFilter));
        }
    }, [sentimentFilter, feedbacks]);

    // Analytics calculations
    const totalCount = feedbacks.length;
    const positiveCount = feedbacks.filter(f => f.sentiment === 'positive').length;
    const neutralCount = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const negativeCount = feedbacks.filter(f => f.sentiment === 'negative').length;

    const positivePct = totalCount ? Math.round((positiveCount / totalCount) * 100) : 0;
    const neutralPct = totalCount ? Math.round((neutralCount / totalCount) * 100) : 0;
    const negativePct = totalCount ? Math.round((negativeCount / totalCount) * 100) : 0;

    // Average sentiment score
    const avgScore = totalCount 
        ? (feedbacks.reduce((sum, f) => sum + (f.sentimentScore || 0), 0) / totalCount).toFixed(1) 
        : '0.0';

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaCommentDots className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Customer Feedback & AI Sentiment</h1>
                        <p className="pro-page-subtitle">Real-time NLP sentiment analysis of customer messages</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading" style={{ padding: '60px 0' }}>Analyzing customer feedback databases...</div>
            ) : feedbacks.length === 0 ? (
                <div className="empty-state-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}><FaCommentDots /></div>
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>No Feedback Submitted Yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Feedback submitted on the Contact page will automatically show up here.</p>
                </div>
            ) : (
                <>
                    {/* Top Analytics Panel */}
                    <div className="dashboard-grid" style={{ marginBottom: '28px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        {/* Overall stats */}
                        <div className="dashboard-card" style={{ borderLeftColor: 'var(--accent)' }}>
                            <div className="dashboard-card-icon" style={{ color: 'var(--accent)' }}><FaCommentDots /></div>
                            <div className="dashboard-card-info">
                                <h3>{totalCount}</h3>
                                <p>Total Submissions</p>
                            </div>
                        </div>

                        {/* Positive feedback */}
                        <div className="dashboard-card" style={{ borderLeftColor: 'var(--success)' }}>
                            <div className="dashboard-card-icon" style={{ color: 'var(--success)' }}><FaSmile /></div>
                            <div className="dashboard-card-info" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3>{positiveCount}</h3>
                                    <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '600' }}>{positivePct}%</span>
                                </div>
                                <p style={{ marginBottom: '6px' }}>Positive Feedback</p>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${positivePct}%`, height: '100%', background: 'var(--success)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Neutral feedback */}
                        <div className="dashboard-card" style={{ borderLeftColor: 'var(--text-secondary)' }}>
                            <div className="dashboard-card-icon" style={{ color: 'var(--text-secondary)' }}><FaMeh /></div>
                            <div className="dashboard-card-info" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3>{neutralCount}</h3>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>{neutralPct}%</span>
                                </div>
                                <p style={{ marginBottom: '6px' }}>Neutral Feedback</p>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${neutralPct}%`, height: '100%', background: 'var(--text-secondary)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Negative feedback */}
                        <div className="dashboard-card" style={{ borderLeftColor: 'var(--error)' }}>
                            <div className="dashboard-card-icon" style={{ color: 'var(--error)' }}><FaFrown /></div>
                            <div className="dashboard-card-info" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3>{negativeCount}</h3>
                                    <span style={{ fontSize: '13px', color: 'var(--error)', fontWeight: '600' }}>{negativePct}%</span>
                                </div>
                                <p style={{ marginBottom: '6px' }}>Negative Feedback</p>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${negativePct}%`, height: '100%', background: 'var(--error)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Net Sentiment Score */}
                        <div className="dashboard-card" style={{ borderLeftColor: Number(avgScore) > 0 ? 'var(--success)' : Number(avgScore) < 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                            <div className="dashboard-card-icon" style={{ color: Number(avgScore) > 0 ? 'var(--success)' : Number(avgScore) < 0 ? 'var(--error)' : 'var(--text-secondary)' }}><FaSlidersH /></div>
                            <div className="dashboard-card-info">
                                <h3>{avgScore > 0 ? `+${avgScore}` : avgScore}</h3>
                                <p>Average Sentiment Index</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Interactive Filter Toggles */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            background: 'var(--bg-glass)', 
                            border: '1px solid var(--border)', 
                            borderRadius: 'var(--radius-md)', 
                            padding: '12px 20px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Filter by Sentiment:</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {[
                                    { id: 'all', label: 'All Messages', count: totalCount, activeColor: 'var(--accent)', bg: 'rgba(255,255,255,0.05)' },
                                    { id: 'positive', label: 'Positive', count: positiveCount, activeColor: 'var(--success)', bg: 'rgba(46, 125, 50, 0.1)' },
                                    { id: 'neutral', label: 'Neutral', count: neutralCount, activeColor: 'var(--text-secondary)', bg: 'rgba(255, 255, 255, 0.05)' },
                                    { id: 'negative', label: 'Negative', count: negativeCount, activeColor: 'var(--error)', bg: 'rgba(233, 69, 96, 0.1)' }
                                ].map((btn) => (
                                    <button
                                        key={btn.id}
                                        onClick={() => setSentimentFilter(btn.id)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            border: '1px solid',
                                            borderColor: sentimentFilter === btn.id ? btn.activeColor : 'var(--border)',
                                            background: sentimentFilter === btn.id ? btn.bg : 'transparent',
                                            color: sentimentFilter === btn.id ? 'white' : 'var(--text-secondary)',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span>{btn.label}</span>
                                        <span style={{ 
                                            background: 'rgba(255,255,255,0.1)', 
                                            padding: '1px 6px', 
                                            borderRadius: '10px', 
                                            fontSize: '10px' 
                                        }}>{btn.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Cards Listing */}
                        {filteredFeedbacks.length === 0 ? (
                            <div className="empty-state-card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-glass)' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No messages found matching "{sentimentFilter}" sentiment category.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {filteredFeedbacks.map((f) => {
                                    const initial = f.name ? f.name.charAt(0).toUpperCase() : '?';
                                    
                                    // Sentiment Tag Custom styling
                                    let badgeIcon = <FaMeh />;
                                    let badgeColor = 'var(--text-secondary)';
                                    let badgeLabel = 'Neutral';
                                    let badgeBg = 'rgba(255, 255, 255, 0.05)';

                                    if (f.sentiment === 'positive') {
                                        badgeIcon = <FaSmile />;
                                        badgeColor = 'var(--success)';
                                        badgeLabel = 'Positive';
                                        badgeBg = 'rgba(46, 125, 50, 0.1)';
                                    } else if (f.sentiment === 'negative') {
                                        badgeIcon = <FaFrown />;
                                        badgeColor = 'var(--error)';
                                        badgeLabel = 'Negative';
                                        badgeBg = 'rgba(233, 69, 96, 0.1)';
                                    }

                                    return (
                                        <div key={f._id} className="cart-summary-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                            <div>
                                                {/* Header Metadata */}
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                                    <div style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        borderRadius: '50%', 
                                                        background: 'linear-gradient(135deg, var(--accent), var(--primary))', 
                                                        color: 'white', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                        {initial}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h4 style={{ color: 'white', margin: '0 0 2px 0', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {f.name}
                                                        </h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                                                            <FaEnvelope style={{ flexShrink: 0 }} />
                                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sentiment Tag & Score */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                    <span style={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px', 
                                                        padding: '4px 10px', 
                                                        borderRadius: '12px', 
                                                        background: badgeBg,
                                                        color: badgeColor,
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        border: `1px solid rgba(255,255,255,0.02)`
                                                    }}>
                                                        {badgeIcon} {badgeLabel}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                        Score: <strong style={{ color: f.sentimentScore > 0 ? 'var(--success)' : f.sentimentScore < 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                                                            {f.sentimentScore > 0 ? `+${f.sentimentScore}` : f.sentimentScore}
                                                        </strong>
                                                    </span>
                                                </div>

                                                {/* Feedback Message */}
                                                <div style={{ 
                                                    background: 'rgba(255, 255, 255, 0.02)', 
                                                    border: '1px solid var(--border)', 
                                                    borderRadius: 'var(--radius-sm)', 
                                                    padding: '12px 14px', 
                                                    fontSize: '13.5px', 
                                                    lineHeight: '1.5', 
                                                    color: 'var(--text-secondary)',
                                                    fontStyle: 'italic'
                                                }}>
                                                    "{f.message}"
                                                </div>
                                            </div>

                                            {/* Date Footer */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                                                <FaCalendarAlt />
                                                <span>
                                                    {new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageFeedback;
