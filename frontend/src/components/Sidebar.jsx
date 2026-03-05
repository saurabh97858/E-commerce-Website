import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';

const Sidebar = () => {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeCategory = searchParams.get('category') || '';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId) => {
        if (categoryId) {
            navigate(`/?category=${categoryId}`);
        } else {
            navigate('/');
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-title">Categories</div>
            <ul className="sidebar-list">
                <li
                    className={`sidebar-item ${!activeCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('')}
                >
                    ALL PRODUCTS
                </li>
                {categories.map((cat) => (
                    <li
                        key={cat._id}
                        className={`sidebar-item ${activeCategory === cat._id ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat._id)}
                    >
                        {cat.name.toUpperCase()}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
