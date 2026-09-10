import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } });
  const [wishCount, setWishCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } });
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart({ items: data.items, totals: data.totals });
    } catch {
      // silent
    }
  }, [user]);

  const refreshWishCount = useCallback(async () => {
    if (!user) { setWishCount(0); return; }
    try {
      const { data } = await api.get('/wishlist');
      setWishCount(data.items.length);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
    refreshWishCount();
  }, [refreshCart, refreshWishCount]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      await api.post('/cart/items', { product_id: productId, quantity });
      await refreshCart();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    await api.put(`/cart/items/${itemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    await refreshCart();
  };

  const toggleWishlist = async (productId) => {
    try {
      await api.post('/wishlist', { product_id: productId });
    } catch (err) {
      if (!err.message.includes('Already')) throw err;
    }
    await refreshWishCount();
  };

  const removeFromWishlist = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    await refreshWishCount();
  };

  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, wishCount, loading, addToCart, updateQuantity, removeItem, clearCart, refreshCart, toggleWishlist, removeFromWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
