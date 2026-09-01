import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { CartProvider } from './contexts/CartContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Search from './pages/Search';
import ChatDetail from './pages/ChatDetail';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Addresses from './pages/Addresses';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminConversations from './pages/admin/AdminConversations';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTeam from './pages/admin/AdminTeam';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#DC2626',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <img src="/icone.png" alt="Logo" style={{ width: 100, height: 100, borderRadius: 20, marginBottom: 20 }} />
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}>Ponto do Borracheiro</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8, fontFamily: 'Inter, sans-serif' }}>Carregando...</p>
        <div style={{
          marginTop: 24,
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <ChatProvider>
              <Routes>
                {/* Rotas do cliente (mobile) */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="chat/:id" element={<ChatDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="search" element={<Search />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="addresses" element={<Addresses />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="privacy" element={<Privacy />} />
                </Route>

                {/* Login do admin (público) */}
                <Route path="/admin" element={<AdminLogin />} />

                {/* Rotas do admin (protegidas) */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route path="conversations" element={<AdminConversations />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </ChatProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;