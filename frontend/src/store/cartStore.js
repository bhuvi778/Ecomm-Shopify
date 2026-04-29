import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items;
        const exists = items.find(i => i.product._id === product._id);
        if (exists) {
          set({ items: items.map(i => i.product._id === product._id ? { ...i, qty: i.qty + qty } : i) });
        } else {
          set({ items: [...items, { product, qty }] });
        }
      },

      removeItem: (productId) => set({ items: get().items.filter(i => i.product._id !== productId) }),

      updateQty: (productId, qty) => {
        if (qty < 1) return get().removeItem(productId);
        set({ items: get().items.map(i => i.product._id === productId ? { ...i, qty } : i) });
      },

      clearCart: () => set({ items: [] }),

      get total() {
        return get().items.reduce((s, i) => s + i.product.price * i.qty, 0);
      },

      get count() {
        return get().items.reduce((s, i) => s + i.qty, 0);
      },
    }),
    { name: 'mkc-cart' }
  )
);

export default useCartStore;
