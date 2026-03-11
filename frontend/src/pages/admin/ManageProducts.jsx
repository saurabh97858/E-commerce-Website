import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', description: '', category: '', stock: '', sizes: '' });
    const [images, setImages] = useState(null);
    const [editing, setEditing] = useState(null);
    const [message, setMessage] = useState('');

    const fetchProducts = async () => {
        const { data } = await API.get('/products');
        setProducts(data);
    };

    const fetchCategories = async () => {
        const { data } = await API.get('/categories');
        setCategories(data);
    };

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                setMessage('Product updated!');
            } else {
                await API.post('/products', fd);
                setMessage('Product added!');
            }
            setForm({ name: '', price: '', description: '', category: '', stock: '', sizes: '' });
            setImages(null);
            setEditing(null);
            fetchProducts();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
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
        if (window.confirm('Delete this product?')) {
            await API.delete(`/products/${id}`);
            fetchProducts();
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">
                {editing ? `Editing Product: ${form.name}` : 'Add New Product'}
            </h2>
            {message && <div className="success-msg">{message}</div>}

            <div className={`admin-form-container ${editing ? 'editing-active' : ''}`}>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Price</label>
                            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3"></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                                <option value="">Select Category</option>
                                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Sizes (comma separated, e.g. 6, 7, 8, 9, 10)</label>
                        <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Product Images {editing && '(leave empty to keep current)'}</label>
                        <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} />
                    </div>
                    <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="submit" className="btn-green">
                            {editing ? 'Update Product Details' : 'Add Product'}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                className="btn-red"
                                onClick={() => {
                                    setEditing(null);
                                    setForm({ name: '', price: '', description: '', category: '', stock: '', sizes: '' });
                                }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <h3 style={{ marginTop: 30, borderBottom: '2px solid #008000', paddingBottom: '10px' }}>
                All Products ({products.length})
            </h3>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th style={{ width: '150px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No products found. Use seed script or form above.</td></tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p._id} className={editing === p._id ? 'row-editing' : ''}>
                                    <td>
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
                                            className="cart-item-img"
                                        />
                                    </td>
                                    <td><strong>{p.name}</strong></td>
                                    <td>₹{p.price}</td>
                                    <td>{p.category?.name}</td>
                                    <td>{p.stock}</td>
                                    <td>
                                        <button
                                            className="btn-green btn-sm"
                                            style={{ marginBottom: '5px', width: '100%' }}
                                            onClick={() => handleEdit(p)}
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            className="btn-red btn-sm"
                                            style={{ width: '100%' }}
                                            onClick={() => handleDelete(p._id)}
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageProducts;
