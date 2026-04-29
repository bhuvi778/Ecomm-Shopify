import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token, loading: false });
        return data;
      },

      register: async (payload) => {
        set({ loading: true });
        const { data } = await api.post('/auth/register', payload);
        set({ user: data.user, token: data.token, loading: false });
        return data;
      },

      logout: () => set({ user: null, token: null }),

      refreshUser: async () => {
        const { data } = await api.get('/auth/me');
        set({ user: data });
      },
    }),
    { name: 'mkc-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

export default useAuthStore;
