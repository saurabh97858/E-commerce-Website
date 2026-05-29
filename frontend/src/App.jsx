import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import Chatbot from './components/Chatbot';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MyPayments = lazy(() => import('./pages/MyPayments'));
const MyAccount = lazy(() => import('./pages/MyAccount'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// Admin pages
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));
const ManagePayments = lazy(() => import('./pages/admin/ManagePayments'));
const ManageFeedback = lazy(() => import('./pages/admin/ManageFeedback'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const ManageAdmins = lazy(() => import('./pages/admin/ManageAdmins'));

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Suspense fallback={<div className="page-loading"><div className="page-loading-spinner"></div></div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Auth />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                  <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                  <Route path="/my-payments" element={<ProtectedRoute><MyPayments /></ProtectedRoute>} />
                  <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                  <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                  <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  <Route path="/super-admin/manage-admins" element={<SuperAdminRoute><ManageAdmins /></SuperAdminRoute>} />
                  <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
                  <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
                  <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
                  <Route path="/admin/payments" element={<AdminRoute><ManagePayments /></AdminRoute>} />
                  <Route path="/admin/feedback" element={<AdminRoute><ManageFeedback /></AdminRoute>} />
                  <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Chatbot />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
