import { useState } from 'react';
import API from '../api/axios';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        try {
            await API.post('/feedback', formData);
            setSuccess('Thank you! Your feedback has been submitted.');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <h2 className="auth-title">Contact Us / Feedback</h2>
                {success && <div className="success-msg">{success}</div>}
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
                    </div>
                    <button type="submit" className="btn-green">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
