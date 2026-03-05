import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '' });
    const [image, setImage] = useState(null);
    const [editing, setEditing] = useState(null);
    const [message, setMessage] = useState('');

    const fetchCategories = async () => {
        const { data } = await API.get('/categories');
        setCategories(data);
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('description', form.description);
        if (image) fd.append('image', image);
        try {
            if (editing) {
                await API.put(`/categories/${editing}`, fd);
                setMessage('Category updated!');
            } else {
                await API.post('/categories', fd);
                setMessage('Category added!');
            }
            setForm({ name: '', description: '' });
            setImage(null);
            setEditing(null);
            fetchCategories();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat._id);
        setForm({ name: cat.name, description: cat.description });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            await API.delete(`/categories/${id}`);
            fetchCategories();
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">{editing ? 'Edit Category' : 'Add Category'}</h2>
            {message && <div className="success-msg">{message}</div>}
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Category Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </div>
                <button type="submit" className="btn-green">{editing ? 'Update' : 'Add'} Category</button>
                {editing && <button type="button" className="btn-red" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
            </form>
            <h3 style={{ marginTop: 30 }}>All Categories</h3>
            <table className="data-table">
                <thead>
                    <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <tr key={cat._id}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>
                                <button className="btn-green btn-sm" onClick={() => handleEdit(cat)}>Edit</button>
                                <button className="btn-red btn-sm" onClick={() => handleDelete(cat._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCategories;
