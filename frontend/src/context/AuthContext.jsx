import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const { data } = await API.get('/auth/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const { data } = await API.post('/auth/register', userData);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const changePassword = async (currentPassword, newPassword) => {
        const { data } = await API.put('/auth/change-password', { currentPassword, newPassword });
        return data;
    };

    const toggleWishlist = async (productId) => {
        if (!user) return false;
        try {
            const { data } = await API.post(`/auth/wishlist/${productId}`);
            fetchWishlist();
            return data.isWishlisted;
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            return false;
        }
    };

    useEffect(() => {
        const interceptor = API.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );
        return () => {
            API.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, wishlist, loading, login, register, logout, changePassword, toggleWishlist }}>
            {children}
        </AuthContext.Provider>
    );
};
