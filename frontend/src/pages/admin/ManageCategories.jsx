import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaTags, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaImage } from 'react-icons/fa';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '' });
    const [image, setImage] = useState(null);
    const [editing, setEditing] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('description', form.description);
        if (image) fd.append('image', image);
        
        try {
            if (editing) {
                await API.put(`/categories/${editing}`, fd);
                setMessage('Category updated successfully!');
            } else {
                await API.post('/categories', fd);
                setMessage('Category added successfully!');
            }
            setForm({ name: '', description: '' });
            setImage(null);
            setEditing(null);
            fetchCategories();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error saving category');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat._id);
        setForm({ name: cat.name, description: cat.description });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await API.delete(`/categories/${id}`);
                setMessage('Category deleted successfully!');
                fetchCategories();
            } catch (err) {
                setMessage(err.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaTags className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Manage Categories</h1>
                        <p className="pro-page-subtitle">Configure shoe categories and classifications</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`success-msg ${message.toLowerCase().includes('error') ? 'error-bg' : ''}`} style={{ marginBottom: '20px' }}>
                    {message}
                </div>
            )}

            <div className="checkout-grid" style={{ gap: '24px' }}>
                {/* Add / Edit Form Card */}
                <div className="checkout-form" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <span style={{ color: 'var(--accent)', fontSize: '18px', display: 'flex' }}>
                            {editing ? <FaEdit /> : <FaPlus />}
                        </span>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'white' }}>
                            {editing ? 'Modify Category' : 'Create Category'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Category Name</label>
                            <input 
                                type="text" 
                                value={form.name} 
                                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                placeholder="e.g. Running, Sneakers, Formals"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input 
                                type="text" 
                                value={form.description} 
                                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                placeholder="Describe the type of footwear..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaImage style={{ fontSize: '12px' }} /> Category Image
                            </label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setImage(e.target.files[0])} 
                                style={{ padding: '8px 0', border: 'none', background: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn-checkout" style={{ flex: 1 }} disabled={loading}>
                                <FaSave style={{ marginRight: '6px' }} />
                                {loading ? 'Saving...' : editing ? 'Update' : 'Add Category'}
                            </button>
                            {editing && (
                                <button 
                                    type="button" 
                                    className="btn-outline-lg" 
                                    style={{ flex: 1 }} 
                                    onClick={() => { 
                                        setEditing(null); 
                                        setForm({ name: '', description: '' }); 
                                    }}
                                >
                                    <FaTimes style={{ marginRight: '6px' }} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Categories List Table */}
                <div className="cart-summary-card" style={{ padding: '24px', flex: 1.5 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        All Categories ({categories.length})
                    </h3>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No categories found. Add one on the left.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat._id}>
                                            <td><strong style={{ color: 'white' }}>{cat.name}</strong></td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{cat.description || 'No description'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button 
                                                        className="btn-outline-sm" 
                                                        onClick={() => handleEdit(cat)}
                                                        title="Edit Category"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        className="btn-outline-sm" 
                                                        style={{ color: 'var(--error)', borderColor: 'rgba(233, 69, 96, 0.3)' }}
                                                        onClick={() => handleDelete(cat._id)}
                                                        title="Delete Category"
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

export default ManageCategories;
