import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loader from './components/ui/Loader';

// Lazy-load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AddressPage = lazy(() => import('./pages/AddressPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

// Route guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
            <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />

            {/* Auth routes */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

            {/* Protected routes */}
            <Route path="/cart" element={<PrivateRoute><MainLayout><CartPage /></MainLayout></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><MainLayout><WishlistPage /></MainLayout></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><MainLayout><CheckoutPage /></MainLayout></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><MainLayout><OrdersPage /></MainLayout></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><MainLayout><OrderDetailPage /></MainLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />
            <Route path="/addresses" element={<PrivateRoute><MainLayout><AddressPage /></MainLayout></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </WishlistProvider>
    </CartProvider>
  );
}
