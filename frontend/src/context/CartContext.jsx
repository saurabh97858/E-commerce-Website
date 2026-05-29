import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart({ items: [] });
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await API.get('/cart');
            setCart(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const addToCart = async (productId, quantity = 1, size = '') => {
        try {
            const { data } = await API.post('/cart/add', { productId, quantity, size });
            setCart(data);
            return data;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const { data } = await API.put('/cart/update', { itemId, quantity });
            setCart(data);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const { data } = await API.delete(`/cart/remove/${itemId}`);
            setCart(data);
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    const cartItemCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    return (
        <CartContext.Provider value={{ cart, cartItemCount, addToCart, updateCartItem, removeFromCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
