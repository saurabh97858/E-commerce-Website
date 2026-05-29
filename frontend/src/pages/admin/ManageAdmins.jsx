import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaVenusMars, FaSave, FaTimes } from 'react-icons/fa';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({
        name: '', surname: '', email: '', password: '', address: '', city: '', pincode: '', gender: 'Male', mobile: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
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
        } finally {
            setLoading(false);
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
        if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
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
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaUsers className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Manage Admins</h1>
                        <p className="pro-page-subtitle">Configure administrative users and authorization credentials</p>
                    </div>
                </div>
            </div>

            {message && <div className="success-msg" style={{ marginBottom: '20px' }}>{message}</div>}
            {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="checkout-grid" style={{ gap: '28px', alignItems: 'start' }}>
                
                {/* Form Section */}
                <div className="checkout-form" style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <span style={{ color: 'var(--accent)', fontSize: '18px', display: 'flex' }}>
                            {editingId ? <FaEdit /> : <FaUserPlus />}
                        </span>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'white' }}>
                            {editingId ? 'Modify Admin Details' : 'Create Admin Profile'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label><FaUser style={{ marginRight: '4px', fontSize: '10px' }} /> First Name</label>
                                <input type="text" name="name" placeholder="John" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label><FaUser style={{ marginRight: '4px', fontSize: '10px' }} /> Last Name</label>
                                <input type="text" name="surname" placeholder="Doe" value={formData.surname} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '12px' }}>
                            <label><FaEnvelope style={{ marginRight: '4px', fontSize: '10px' }} /> Email Address</label>
                            <input type="email" name="email" placeholder="john.doe@store.com" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group" style={{ marginTop: '12px' }}>
                            <label><FaLock style={{ marginRight: '4px', fontSize: '10px' }} /> {editingId ? 'New Password (Optional)' : 'Password'}</label>
                            <input type="password" name="password" placeholder={editingId ? 'Leave blank to keep unchanged' : 'Minimum 6 characters'} value={formData.password} onChange={handleChange} required={!editingId} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                            <div className="form-group">
                                <label><FaPhone style={{ marginRight: '4px', fontSize: '10px' }} /> Mobile Number</label>
                                <input type="text" name="mobile" placeholder="10-digit number" value={formData.mobile} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label><FaVenusMars style={{ marginRight: '4px', fontSize: '10px' }} /> Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="Male" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Male</option>
                                    <option value="Female" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Female</option>
                                    <option value="Other" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '12px' }}>
                            <label><FaMapMarkerAlt style={{ marginRight: '4px', fontSize: '10px' }} /> Street Address</label>
                            <input type="text" name="address" placeholder="123 Store Lane" value={formData.address} onChange={handleChange} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" placeholder="Mumbai" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input type="text" name="pincode" placeholder="400001" value={formData.pincode} onChange={handleChange} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                            <button type="submit" className="btn-checkout" style={{ flex: 1 }} disabled={loading}>
                                <FaSave style={{ marginRight: '6px' }} />
                                {loading ? 'Saving...' : editingId ? 'Update Admin' : 'Create Admin'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-outline-lg" style={{ flex: 1 }} onClick={cancelEdit}>
                                    <FaTimes style={{ marginRight: '6px' }} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="cart-summary-card" style={{ padding: '24px', flex: 1.2 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Active Store Administrators ({admins.length})
                    </h3>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email / Phone</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No administrator accounts found.
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin) => (
                                        <tr key={admin._id} style={{ opacity: editingId === admin._id ? 0.6 : 1 }}>
                                            <td>
                                                <div style={{ color: 'white', fontWeight: '600' }}>
                                                    {admin.name} {admin.surname}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    Gender: {admin.gender}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', color: 'white' }}>{admin.email}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{admin.mobile}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button 
                                                        className="btn-outline-sm" 
                                                        onClick={() => handleEdit(admin)}
                                                        title="Edit Profile"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        className="btn-outline-sm" 
                                                        style={{ color: 'var(--error)', borderColor: 'rgba(233, 69, 96, 0.3)' }}
                                                        onClick={() => handleDelete(admin._id)}
                                                        title="Delete Admin Account"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAdmins;
