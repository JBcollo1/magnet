import React, { createContext, useContext, useState, useEffect } from 'react';

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
  isLoading: boolean;
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

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Cart data persistence functions
const saveCartToCookies = (cartItems: CartItem[]) => {
  try {
    const cartData = JSON.stringify(cartItems);
    setCookie('cart_items', cartData, 30); // Store for 30 days
  } catch (error) {
    console.error('Error saving cart to cookies:', error);
  }
};

const loadCartFromCookies = (): CartItem[] => {
  try {
    const cartData = getCookie('cart_items');
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error loading cart from cookies:', error);
  }
  return [];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart data from cookies on component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = loadCartFromCookies();
        setCartItems(savedCart);
      } catch (error) {
        console.error('Error loading cart from cookies:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart data to cookies whenever cartItems changes (but not during initial load)
  useEffect(() => {
    if (!isLoading) {
      saveCartToCookies(cartItems);
    }
  }, [cartItems, isLoading]);

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
      return [...prev, { 
        ...product, 
        quantity: 1,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const addCustomProductToCart = (customProduct: CartItem) => {
    setCartItems(prev => [...prev, {
      ...customProduct,
      addedAt: customProduct.addedAt || new Date().toISOString()
    }]);
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
    // Also clear the cookie
    deleteCookie('cart_items');
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
      isLoading,
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