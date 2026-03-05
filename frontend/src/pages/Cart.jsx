import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, updateCartItem, removeFromCart } = useCart();
    const navigate = useNavigate();

    const total = cart.items
        ? cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
        : 0;

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="page-container">
                <h2 className="page-title">My Cart</h2>
                <p className="no-products">Your cart is empty.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title">My Cart</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.items.map((item) => (
                        <tr key={item._id}>
                            <td>
                                <img
                                    src={item.product?.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : 'https://via.placeholder.com/60'}
                                    alt={item.product?.name}
                                    className="cart-item-img"
                                />
                            </td>
                            <td>{item.product?.name} {item.size && `(Size: ${item.size})`}</td>
                            <td>₹{item.product?.price}</td>
                            <td>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateCartItem(item._id, parseInt(e.target.value))}
                                    className="qty-input"
                                />
                            </td>
                            <td>₹{(item.product?.price || 0) * item.quantity}</td>
                            <td>
                                <button onClick={() => removeFromCart(item._id)} className="btn-red">Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="cart-total">
                <strong>Total: ₹{total}</strong>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-green">Proceed to Checkout</button>
        </div>
    );
};

export default Cart;
