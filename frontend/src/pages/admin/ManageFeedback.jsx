import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const { data } = await API.get('/feedback');
            setFeedbacks(data);
        };
        fetchFeedbacks();
    }, []);

    return (
        <div className="page-container">
            <h2 className="page-title">Customer Feedback</h2>
            {feedbacks.length === 0 ? (
                <p className="no-products">No feedback yet.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {feedbacks.map((f) => (
                            <tr key={f._id}>
                                <td>{f.name}</td>
                                <td>{f.email}</td>
                                <td>{f.message}</td>
                                <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageFeedback;
