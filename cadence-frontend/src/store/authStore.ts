import { create } from 'zustand';
import axios from 'axios';
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
  signup: (orgName: string, name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || fallback;
  }
  return fallback;
}

const storedToken = localStorage.getItem('cadence_token');
const storedUserJson = localStorage.getItem('cadence_user');
const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

export const useAuthStore = create<AuthStore>((set, get) => ({
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
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Login failed. Please try again.') };
    }
  },

  signup: async (orgName, name, email, password) => {
    try {
      await api.post('/auth/signup', { orgName, name, email, password });
      return await get().login(email, password);
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Could not create your account. Please try again.') };
    }
  },

  logout: () => {
    localStorage.removeItem('cadence_token');
    localStorage.removeItem('cadence_user');
    set({ token: null, user: null });
  },
}));