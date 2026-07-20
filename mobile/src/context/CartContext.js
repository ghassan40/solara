// context/CartContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.getCart();
      setItems(data.items);
      setSubtotal(data.subtotal);
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function addToCart(productId, quantity = 1) {
    const { data } = await api.addToCart(productId, quantity);
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  async function updateQuantity(itemId, quantity) {
    const { data } = await api.updateCartItem(itemId, quantity);
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  async function removeItem(itemId) {
    const { data } = await api.removeCartItem(itemId);
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  async function clearCart() {
    const { data } = await api.clearCart();
    setItems(data.items);
    setSubtotal(data.subtotal);
  }

  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
