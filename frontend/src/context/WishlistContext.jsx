import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlist({ products: [] }); return; }
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist', { productId });
      await fetchWishlist();
      toast.success(data.message);
      return data.added;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.products?.some(p => {
      const id = p._id || p;
      return id.toString() === productId.toString();
    }) || false;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
