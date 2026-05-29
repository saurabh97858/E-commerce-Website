import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FaBox, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaRupeeSign, FaImage, FaListUl, FaWarehouse, FaRulerCombined } from 'react-icons/fa';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', description: '', category: '', stock: '', sizes: '' });
    const [images, setImages] = useState(null);
    const [editing, setEditing] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('price', form.price);
        fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('stock', form.stock);
        fd.append('sizes', JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)));
        if (images) {
            for (let i = 0; i < images.length; i++) {
                fd.append('images', images[i]);
            }
        }
        try {
            if (editing) {
                await API.put(`/products/${editing}`, fd);
                setMessage('Product updated successfully!');
            } else {
                await API.post('/products', fd);
                setMessage('Product added successfully!');
            }
            setForm({ name: '', price: '', description: '', category: '', stock: '', sizes: '' });
            setImages(null);
            setEditing(null);
            fetchProducts();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error processing product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p) => {
        setEditing(p._id);
        setForm({
            name: p.name, price: p.price, description: p.description,
            category: p.category?._id || '', stock: p.stock,
            sizes: p.sizes ? p.sizes.join(', ') : ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await API.delete(`/products/${id}`);
                setMessage('Product deleted successfully!');
                fetchProducts();
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    return (
        <div className="pro-page">
            <div className="pro-page-header">
                <div className="pro-page-header-left">
                    <FaBox className="pro-page-icon" />
                    <div>
                        <h1 className="pro-page-title">Manage Products</h1>
                        <p className="pro-page-subtitle">{products.length} products total in store inventory</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`success-msg ${message.toLowerCase().includes('error') ? 'error-bg' : ''}`} style={{ marginBottom: '24px' }}>
                    {message}
                </div>
            )}

            {/* Form Section */}
            <div className="checkout-form" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '18px', display: 'flex' }}>
                        {editing ? <FaEdit /> : <FaPlus />}
                    </span>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'white' }}>
                        {editing ? `Edit Product: ${form.name}` : 'Add New Product'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                value={form.name} 
                                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                placeholder="e.g. Air Max Running Shoes"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaRupeeSign style={{ fontSize: '11px' }} /> Price (INR)
                            </label>
                            <input 
                                type="number" 
                                value={form.price} 
                                onChange={(e) => setForm({ ...form, price: e.target.value })} 
                                placeholder="e.g. 2999"
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Description</label>
                        <textarea 
                            value={form.description} 
                            onChange={(e) => setForm({ ...form, description: e.target.value })} 
                            placeholder="Describe product details, materials, aesthetics..."
                            rows="3"
                        ></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaListUl style={{ fontSize: '11px' }} /> Category
                            </label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                                <option value="" style={{ background: 'var(--bg-secondary)', color: 'white' }}>Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id} style={{ background: 'var(--bg-secondary)', color: 'white' }}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaWarehouse style={{ fontSize: '11px' }} /> Stock Quantity
                            </label>
                            <input 
                                type="number" 
                                value={form.stock} 
                                onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                                placeholder="e.g. 50"
                                required 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaRulerCombined style={{ fontSize: '11px' }} /> Shoe Sizes (comma separated)
                            </label>
                            <input 
                                type="text" 
                                value={form.sizes} 
                                onChange={(e) => setForm({ ...form, sizes: e.target.value })} 
                                placeholder="e.g. 6, 7, 8, 9, 10"
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaImage style={{ fontSize: '11px' }} /> Product Images {editing && '(leave empty to keep current)'}
                            </label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => setImages(e.target.files)} 
                                style={{ padding: '8px 0', border: 'none', background: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button type="submit" className="btn-checkout" style={{ width: 'auto', padding: '12px 32px' }} disabled={loading}>
                            <FaSave style={{ marginRight: '6px' }} />
                            {loading ? 'Processing...' : editing ? 'Update Product Details' : 'Add Product'}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                className="btn-outline-lg"
                                style={{ width: 'auto', padding: '12px 24px' }}
                                onClick={() => {
                                    setEditing(null);
                                    setForm({ name: '', price: '', description: '', category: '', stock: '', sizes: '' });
                                }}
                            >
                                <FaTimes style={{ marginRight: '6px' }} /> Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Table Section */}
            <div className="cart-summary-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    All Products ({products.length})
                </h3>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '70px' }}>Thumbnail</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No products found in database.
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p._id} style={{ opacity: editing === p._id ? 0.6 : 1 }}>
                                        <td>
                                            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-glass)' }}>
                                                <img
                                                    src={
                                                        (() => {
                                                            const img = p.images?.[0];
                                                            if (!img || typeof img !== 'string' || img.trim() === '') return '/placeholder.png';
                                                            if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                                            return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
                                                        })()
                                                    }
                                                    alt={p.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        </td>
                                        <td><strong style={{ color: 'white' }}>{p.name}</strong></td>
                                        <td><strong style={{ color: 'var(--accent)' }}>₹{p.price}</strong></td>
                                        <td><span className="user-role-badge" style={{ textTransform: 'uppercase', fontSize: '10px' }}>{p.category?.name || 'Unassigned'}</span></td>
                                        <td>
                                            <span style={{ 
                                                color: p.stock < 10 ? 'var(--error)' : p.stock < 30 ? 'var(--warning)' : 'var(--success)', 
                                                fontWeight: '600' 
                                            }}>
                                                {p.stock} pcs
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <button
                                                    className="btn-outline-sm"
                                                    onClick={() => handleEdit(p)}
                                                    title="Edit Product"
                                                    style={{ flex: 1 }}
                                                >
                                                    <FaEdit style={{ marginRight: '4px' }} /> Edit
                                                </button>
                                                <button
                                                    className="btn-outline-sm"
                                                    style={{ color: 'var(--error)', borderColor: 'rgba(233, 69, 96, 0.3)', flex: 1 }}
                                                    onClick={() => handleDelete(p._id)}
                                                    title="Delete Product"
                                                >
                                                    <FaTrash style={{ marginRight: '4px' }} /> Del
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
    );
};

export default ManageProducts;
