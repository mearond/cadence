import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  org_id: number;
  preferred_language?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

}

const storedToken = localStorage.getItem('cadence_token');
const storedUserJson = localStorage.getItem('cadence_user');
const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser,
  token: storedToken,

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('cadence_token', token);
      localStorage.setItem('cadence_user', JSON.stringify(user));

      set({ token, user });
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('cadence_token');
    localStorage.removeItem('cadence_user');
    set({ token: null, user: null });
  },

}));