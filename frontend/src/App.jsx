import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import { Spinner } from './components/common/UI';
import { revealPage } from './hooks/useReveal';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import TrackOrder from './pages/TrackOrder';
import CustomDesign from './pages/CustomDesign';
import Feedback from './pages/Feedback';
import Inspiration from './pages/Inspiration';
import NotFound from './pages/NotFound';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminShipments from './pages/admin/AdminShipments';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCustomRequests from './pages/admin/AdminCustomRequests';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminContent from './pages/admin/AdminContent';

const Protected = ({ children, admin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const location = useLocation();

  // Scroll reveal: re-scan on every route change. Elements mounted later
  // (async grids, reviews) are picked up automatically by the MutationObserver
  // inside revealPage().
  useEffect(() => {
    revealPage();
  }, [location]);

  return (
  <Routes>
    <Route path="/admin" element={<Protected admin><AdminLayout /></Protected>}>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="customers" element={<AdminCustomers />} />
      <Route path="payments" element={<AdminPayments />} />
      <Route path="shipments" element={<AdminShipments />} />
      <Route path="reviews" element={<AdminReviews />} />
      <Route path="coupons" element={<AdminCoupons />} />
      <Route path="custom-requests" element={<AdminCustomRequests />} />
      <Route path="feedback" element={<AdminFeedback />} />
      <Route path="content" element={<AdminContent />} />
    </Route>

    <Route
      path="*"
      element={
        <>
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-[70vh]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
              <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/orders" element={<Protected><Orders /></Protected>} />
              <Route path="/orders/:id" element={<Protected><OrderDetails /></Protected>} />
              <Route path="/orders/:id/tracking" element={<Protected><TrackOrder /></Protected>} />
              <Route path="/custom-design" element={<CustomDesign />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/inspiration" element={<Inspiration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </>
      }
    />
  </Routes>
  );
};

export default App;
