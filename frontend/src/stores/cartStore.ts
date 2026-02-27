import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

interface Cart {
  cart_id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  itbis: number;
  total: number;
}

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getAuthHeaders: () => Promise<{ Authorization: string } | {}>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  getAuthHeaders: async () => {
    const token = await AsyncStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const headers = await get().getAuthHeaders();
      const response = await axios.get(`${BACKEND_URL}/api/cart`, { headers });
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const headers = await get().getAuthHeaders();
      const response = await axios.post(
        `${BACKEND_URL}/api/cart/add`,
        { product_id: productId, quantity },
        { headers }
      );
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const headers = await get().getAuthHeaders();
      const response = await axios.put(
        `${BACKEND_URL}/api/cart/update?product_id=${productId}&quantity=${quantity}`,
        {},
        { headers }
      );
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeFromCart: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const headers = await get().getAuthHeaders();
      const response = await axios.delete(
        `${BACKEND_URL}/api/cart/remove/${productId}`,
        { headers }
      );
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const headers = await get().getAuthHeaders();
      const response = await axios.delete(`${BACKEND_URL}/api/cart/clear`, { headers });
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
