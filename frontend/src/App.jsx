import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import MyPayments from './pages/MyPayments';
import MyAccount from './pages/MyAccount';
import ChangePassword from './pages/ChangePassword';
import Contact from './pages/Contact';

import Dashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManagePayments from './pages/admin/ManagePayments';
import ManageFeedback from './pages/admin/ManageFeedback';
import Reports from './pages/admin/Reports';
import ManageAdmins from './pages/admin/ManageAdmins';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/feedback" element={<Contact />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/my-payments" element={<ProtectedRoute><MyPayments /></ProtectedRoute>} />
                <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/super-admin/manage-admins" element={<SuperAdminRoute><ManageAdmins /></SuperAdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
                <Route path="/admin/payments" element={<AdminRoute><ManagePayments /></AdminRoute>} />
                <Route path="/admin/feedback" element={<AdminRoute><ManageFeedback /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
