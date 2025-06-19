import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  image: string;
  description: string;
}

export interface CustomImage {
  id: string | number;
  url: string;
  name: string;
  uploadStatus?: 'approved' | 'pending' | 'uploading' | 'error';
}

export interface CartItem extends Product {
  quantity: number;
  customImages?: CustomImage[];
  addedAt?: string;
  approvedCount?: number;
  pendingCount?: number;
  orderId?: string | number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product & { customImages?: CustomImage[] }) => void;
  addCustomProductToCart: (customProduct: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getOrderIds: () => (string | number)[];
  getItemByOrderId: (orderId: string | number) => CartItem | undefined;
  getItemsByOrderId: (orderId: string | number) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product & { customImages?: CustomImage[] }) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const addCustomProductToCart = (customProduct: CartItem) => {
    setCartItems(prev => [...prev, customProduct]);
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get all unique order IDs from cart items
  const getOrderIds = (): (string | number)[] => {
    const orderIds = cartItems
      .map(item => item.orderId)
      .filter((orderId): orderId is string | number => orderId !== undefined);
    return [...new Set(orderIds)]; // Remove duplicates
  };

  // Get a specific cart item by order ID
  const getItemByOrderId = (orderId: string | number): CartItem | undefined => {
    return cartItems.find(item => item.orderId === orderId);
  };

  // Get all cart items with a specific order ID
  const getItemsByOrderId = (orderId: string | number): CartItem[] => {
    return cartItems.filter(item => item.orderId === orderId);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addCustomProductToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getOrderIds,
      getItemByOrderId,
      getItemsByOrderId,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};