import { useState } from 'react';

const DashboardCharts = ({ dailySales = [], categoryReports = [] }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoveredBar, setHoveredBar] = useState(null);

    // --- Line Chart Configuration (7-day Sales & Orders) ---
    const lineW = 600;
    const lineH = 260;
    const padL = 60;
    const padR = 20;
    const padT = 30;
    const padB = 40;

    const chartW = lineW - padL - padR;
    const chartH = lineH - padT - padB;

    const maxSales = Math.max(...dailySales.map(d => d.sales), 100);
    const stepX = dailySales.length > 1 ? chartW / (dailySales.length - 1) : chartW;

    // Build line coordinates
    const points = dailySales.map((d, idx) => {
        const x = padL + idx * stepX;
        const y = lineH - padB - (d.sales / maxSales) * chartH;
        return { x, y, data: d };
    });

    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        areaPath = `${linePath} L ${points[points.length - 1].x} ${lineH - padB} L ${points[0].x} ${lineH - padB} Z`;
    }

    // --- Bar Chart Configuration (Category Sales) ---
    const activeCats = categoryReports.filter(c => c.totalSales > 0 || c.totalProducts > 0);
    const maxCatSales = Math.max(...activeCats.map(c => c.totalSales), 100);
    const barW = 600;
    const barH = 260;
    const stepBar = activeCats.length > 0 ? chartW / activeCats.length : chartW;
    const widthBar = Math.min(36, stepBar * 0.5);

    const bars = activeCats.map((c, idx) => {
        const x = padL + idx * stepBar + (stepBar - widthBar) / 2;
        const barHeight = (c.totalSales / maxCatSales) * chartH;
        const y = barH - padB - barHeight;
        return { x, y, w: widthBar, h: Math.max(4, barHeight), data: c };
    });

    return (
        <div className="dashboard-charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginTop: '30px' }}>
            
            {/* Sales Trend Line Chart */}
            <div className="chart-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'relative' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Sales Trend (Last 7 Days)</h3>
                
                {dailySales.length === 0 ? (
                    <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
                ) : (
                    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                        <svg viewBox={`0 0 ${lineW} ${lineH}`} width="100%" height="100%" style={{ display: 'block', minWidth: '500px' }}>
                            <defs>
                                <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const y = padT + ratio * chartH;
                                const labelVal = Math.round(maxSales * (1 - ratio));
                                return (
                                    <g key={idx}>
                                        <line x1={padL} y1={y} x2={lineW - padR} y2={y} stroke="var(--border)" strokeDasharray="3,3" />
                                        <text x={padL - 10} y={y + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end">₹{labelVal}</text>
                                    </g>
                                );
                            })}

                            {/* X Axis Date Labels */}
                            {points.map((p, idx) => (
                                <text key={idx} x={p.x} y={lineH - 15} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                                    {p.data.date.split('-').slice(1).join('/')}
                                </text>
                            ))}

                            {/* Area fill under line */}
                            <path d={areaPath} fill="url(#lineAreaGradient)" />

                            {/* Line path */}
                            <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Interactive Data Dots */}
                            {points.map((p, idx) => (
                                <circle
                                    key={idx}
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredPoint === idx ? '6' : '4'}
                                    fill={hoveredPoint === idx ? 'var(--accent)' : 'var(--primary)'}
                                    stroke="var(--bg-card)"
                                    strokeWidth="2"
                                    style={{ cursor: 'pointer', transition: 'r 0.15s ease, fill 0.15s ease' }}
                                    onMouseEnter={() => setHoveredPoint(idx)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            ))}
                        </svg>

                        {/* Line Chart Tooltip */}
                        {hoveredPoint !== null && (
                            <div style={{
                                position: 'absolute',
                                left: `${(points[hoveredPoint].x / lineW) * 100}%`,
                                top: `${(points[hoveredPoint].y / lineH) * 100 - 15}%`,
                                transform: 'translate(-50%, -100%)',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--primary)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 12px',
                                color: 'white',
                                fontSize: '12px',
                                pointerEvents: 'none',
                                boxShadow: 'var(--shadow-md)',
                                zIndex: 10,
                                whiteSpace: 'nowrap'
                            }}>
                                <strong>{points[hoveredPoint].data.date}</strong><br />
                                Sales: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>₹{points[hoveredPoint].data.sales}</span><br />
                                Orders: <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{points[hoveredPoint].data.orders}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Category Performance Bar Chart */}
            <div className="chart-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'relative' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Sales by Category</h3>

                {activeCats.length === 0 ? (
                    <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No category sales data yet</div>
                ) : (
                    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                        <svg viewBox={`0 0 ${barW} ${barH}`} width="100%" height="100%" style={{ display: 'block', minWidth: '500px' }}>
                            <defs>
                                <linearGradient id="barGlowGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent)" />
                                    <stop offset="100%" stopColor="#e28743" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const y = padT + ratio * chartH;
                                const labelVal = Math.round(maxCatSales * (1 - ratio));
                                return (
                                    <g key={idx}>
                                        <line x1={padL} y1={y} x2={barW - padR} y2={y} stroke="var(--border)" strokeDasharray="3,3" />
                                        <text x={padL - 10} y={y + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end">₹{labelVal}</text>
                                    </g>
                                );
                            })}

                            {/* Bar elements */}
                            {bars.map((b, idx) => (
                                <g key={idx}>
                                    <rect
                                        x={b.x}
                                        y={b.y}
                                        width={b.w}
                                        height={b.h}
                                        rx="4"
                                        ry="4"
                                        fill={hoveredBar === idx ? 'var(--primary)' : 'url(#barGlowGradient)'}
                                        style={{ cursor: 'pointer', transition: 'fill 0.2s ease, y 0.2s ease, height 0.2s ease' }}
                                        onMouseEnter={() => setHoveredBar(idx)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    />
                                    {/* X Axis Category labels */}
                                    <text x={b.x + b.w / 2} y={barH - 15} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                                        {b.data.category.substring(0, 10)}
                                    </text>
                                </g>
                            ))}
                        </svg>

                        {/* Bar Chart Tooltip */}
                        {hoveredBar !== null && (
                            <div style={{
                                position: 'absolute',
                                left: `${((bars[hoveredBar].x + bars[hoveredBar].w / 2) / barW) * 100}%`,
                                top: `${(bars[hoveredBar].y / barH) * 100 - 15}%`,
                                transform: 'translate(-50%, -100%)',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--accent)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 12px',
                                color: 'white',
                                fontSize: '12px',
                                pointerEvents: 'none',
                                boxShadow: 'var(--shadow-md)',
                                zIndex: 10,
                                whiteSpace: 'nowrap'
                            }}>
                                <strong>{bars[hoveredBar].data.category}</strong><br />
                                Sales: <span style={{ color: 'var(--accent)', fontWeight: '600' }}>₹{bars[hoveredBar].data.totalSales}</span><br />
                                Sold: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{bars[hoveredBar].data.totalQuantitySold} units</span><br />
                                Products: <span style={{ color: 'white', fontWeight: '500' }}>{bars[hoveredBar].data.totalProducts}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default DashboardCharts;
