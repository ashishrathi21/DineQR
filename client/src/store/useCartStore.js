import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],
  tableNumber: '',
  
  setTableNumber: (num) => set({ tableNumber: num }),
  
  addToCart: (item) => set((state) => {
    const existing = state.cart.find((c) => c._id === item._id);
    if (existing) {
      return { cart: state.cart.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c) };
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] };
  }),

  removeFromCart: (itemId) => set((state) => {
    const existing = state.cart.find((c) => c._id === itemId);
    if (existing && existing.quantity > 1) {
      return { cart: state.cart.map((c) => c._id === itemId ? { ...c, quantity: c.quantity - 1 } : c) };
    }
    return { cart: state.cart.filter((c) => c._id !== itemId) };
  }),

  clearCart: () => set({ cart: [], tableNumber: '' }),

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
