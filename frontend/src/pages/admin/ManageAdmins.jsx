import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({
        name: '', surname: '', email: '', password: '', address: '', city: '', pincode: '', gender: 'Male', mobile: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get('/admin/admins');
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await API.post('/admin/create-admin', formData);
            setMessage('Admin created successfully.');
            setFormData({
                name: '', surname: '', email: '', password: '', address: '', city: '', pincode: '', gender: 'Male', mobile: ''
            });
            fetchAdmins();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin.');
        }
    };

    return (
        <div className="manage-container">
            <h2>Manage Admins</h2>
            {message && <div className="success-msg" style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
            {error && <div className="error-msg" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div className="form-section">
                <h3>Create New Admin</h3>
                <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <input type="text" name="name" placeholder="First Name" value={formData.name} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="text" name="surname" placeholder="Last Name" value={formData.surname} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="text" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required style={{ padding: '10px' }} />
                    <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '10px' }}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required style={{ gridColumn: 'span 2', padding: '10px' }} />
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required style={{ padding: '10px' }} />

                    <button type="submit" className="submit-btn" style={{ gridColumn: 'span 2', padding: '12px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>Create Admin</button>
                </form>
            </div>

            <div className="list-section" style={{ marginTop: '40px' }}>
                <h3>Existing Admins</h3>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Mobile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin._id}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{admin.name} {admin.surname}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{admin.email}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{admin.mobile}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAdmins;
