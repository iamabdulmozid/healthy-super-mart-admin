// src/context/CartContext.tsx
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '@/types/product';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  cart: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

function calculateTotals(items: CartItem[]): { totalItems: number; totalAmount: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  return { totalItems, totalAmount };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const product = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = state.items.map(item => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice 
              }
            : item
        );
      } else {
        // Add new item to cart
        // Use posPrice if available, otherwise fall back to retailPrice
        const unitPrice = Number(product.posPrice !== undefined && product.posPrice !== null 
          ? product.posPrice 
          : product.retailPrice);
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity: 1,
          unitPrice,
          total: unitPrice,
        };
        newItems = [...state.items, newItem];
      }

      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.id !== id);
        const { totalItems, totalAmount } = calculateTotals(newItems);
        return {
          items: newItems,
          totalItems,
          totalAmount,
        };
      }

      const newItems = state.items.map(item =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      );
      
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}