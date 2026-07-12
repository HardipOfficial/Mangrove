import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart({ items: [] }); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
      setTotalPrice(data.totalPrice);
    } catch {} finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/cart/${productId}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch {}
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [] });
      setTotalPrice(0);
    } catch {}
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, totalPrice, loading, itemCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
