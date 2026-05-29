import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaChartBar, FaTags, FaBox, FaWarehouse, FaShoppingBag, FaRupeeSign } from 'react-icons/fa';

const Reports = () => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await API.get('/admin/reports');
                setReport(data);
            } catch (error) {
                console.error('Error fetching report:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    // Aggregate stats for top dashboard cards
    const totalSalesSum = report.reduce((sum, r) => sum + (r.totalSales || 0), 0);
    const totalQtySoldSum = report.reduce((sum, r) => sum + (r.totalQuantitySold || 0), 0);
    const totalProductsSum = report.reduce((sum, r) => sum + (r.totalProducts || 0), 0);
    const totalStockSum = report.reduce((sum, r) => sum + (r.totalStock || 0), 0);

    const statCards = [
        { label: 'Cumulative Sales', value: `₹${totalSalesSum}`, icon: <FaRupeeSign />, color: 'var(--success)' },
        { label: 'Units Sold', value: `${totalQtySoldSum} units`, icon: <FaShoppingBag />, color: 'var(--accent)' },
        { label: 'Active Catalog', value: `${totalProductsSum} types`, icon: <FaBox />, color: '#0066cc' },
        { label: 'Total In-Stock', value: `${totalStockSum} pcs`, icon: <FaWarehouse />, color: 'var(--warning)' },
    ];

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaChartBar className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Category-wise Reports</h1>
                        <p className="pro-page-subtitle">Product volume, sales performance, and stock distribution</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading" style={{ padding: '40px 0' }}>Loading inventory analytics...</div>
            ) : (
                <>
                    {/* Aggregate metrics grid */}
                    <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                        {statCards.map((card, idx) => (
                            <div key={idx} className="dashboard-card" style={{ borderLeftColor: card.color }}>
                                <div className="dashboard-card-icon" style={{ color: card.color }}>{card.icon}</div>
                                <div className="dashboard-card-info">
                                    <h3>{card.value}</h3>
                                    <p>{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown table */}
                    <div className="cart-summary-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                            Breakdown by Category
                        </h3>

                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Total Products</th>
                                        <th>Total Stock</th>
                                        <th>Qty Sold</th>
                                        <th>Total Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No category records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        report.map((r, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaTags style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                                                        <strong style={{ color: 'white' }}>{r.category || 'Unknown'}</strong>
                                                    </div>
                                                </td>
                                                <td>{r.totalProducts}</td>
                                                <td>{r.totalStock} pcs</td>
                                                <td>{r.totalQuantitySold} pcs</td>
                                                <td>
                                                    <strong style={{ color: 'var(--success)' }}>₹{r.totalSales}</strong>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
