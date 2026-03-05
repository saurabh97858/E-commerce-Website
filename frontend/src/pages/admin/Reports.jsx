import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Reports = () => {
    const [report, setReport] = useState([]);

    useEffect(() => {
        const fetchReport = async () => {
            const { data } = await API.get('/admin/reports');
            setReport(data);
        };
        fetchReport();
    }, []);

    return (
        <div className="page-container">
            <h2 className="page-title">Category-wise Reports</h2>
            <table className="data-table">
                <thead>
                    <tr><th>Category</th><th>Total Products</th><th>Total Stock</th><th>Qty Sold</th><th>Total Sales</th></tr>
                </thead>
                <tbody>
                    {report.map((r, idx) => (
                        <tr key={idx}>
                            <td>{r.category}</td>
                            <td>{r.totalProducts}</td>
                            <td>{r.totalStock}</td>
                            <td>{r.totalQuantitySold}</td>
                            <td>₹{r.totalSales}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Reports;
