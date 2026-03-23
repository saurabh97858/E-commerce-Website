import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({
        name: '', surname: '', email: '', password: '', address: '', city: '', pincode: '', gender: 'Male', mobile: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

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
            if (editingId) {
                await API.put(`/admin/update-admin/${editingId}`, formData);
                setMessage('Admin updated successfully.');
            } else {
                await API.post('/admin/create-admin', formData);
                setMessage('Admin created successfully.');
            }
            setFormData({
                name: '', surname: '', email: '', password: '', address: '', city: '', pincode: '', gender: 'Male', mobile: ''
            });
            setEditingId(null);
            fetchAdmins();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request.');
        }
    };

    const handleEdit = (admin) => {
        setEditingId(admin._id);
        setFormData({
            name: admin.name,
            surname: admin.surname,
            email: admin.email,
            password: '', // Keep password blank unless changing
            address: admin.address,
            city: admin.city,
            pincode: admin.pincode,
            gender: admin.gender,
            mobile: admin.mobile
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                await API.delete(`/admin/delete-admin/${id}`);
                setMessage('Admin deleted successfully.');
                fetchAdmins();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete admin.');
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: '', surname: '', email: '', password: '', address: '', city: '', pincode: '', gender: 'Male', mobile: ''
        });
    };

    return (
        <div className="manage-container">
            <h2>Manage Admins</h2>
            {message && <div className="success-msg" style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
            {error && <div className="error-msg" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div className="form-section">
                <h3>{editingId ? 'Edit Admin' : 'Create New Admin'}</h3>
                <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <input type="text" name="name" placeholder="First Name" value={formData.name} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="text" name="surname" placeholder="Last Name" value={formData.surname} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="password" name="password" placeholder={editingId ? 'Password (leave blank to keep current)' : 'Password'} value={formData.password} onChange={handleChange} required={!editingId} style={{ padding: '10px' }} />
                    <input type="text" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required style={{ padding: '10px' }} />
                    <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '10px' }}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required style={{ gridColumn: 'span 2', padding: '10px' }} />
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required style={{ padding: '10px' }} />
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required style={{ padding: '10px' }} />

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="submit-btn" style={{ flex: 1, padding: '12px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
                            {editingId ? 'Update Admin' : 'Create Admin'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} style={{ flex: 1, padding: '12px', background: '#ccc', color: '#333', border: 'none', cursor: 'pointer' }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="list-section" style={{ marginTop: '40px' }}>
                <h3>Existing Admins</h3>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', border: '1px solid #ddd' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Mobile</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin._id}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{admin.name} {admin.surname}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{admin.email}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{admin.mobile}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                                    <button onClick={() => handleEdit(admin)} style={{ padding: '5px 10px', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                                    <button onClick={() => handleDelete(admin._id)} style={{ padding: '5px 10px', background: '#cc0000', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAdmins;
