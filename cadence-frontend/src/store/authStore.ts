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
  mustChangePassword?: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (orgName: string, name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
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
function readStoredUser(json: string | null = localStorage.getItem('cadence_user')): User | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    // Corrupt value (e.g. edited by hand): treat as signed out rather than crash on load.
    localStorage.removeItem('cadence_user');
    return null;
  }
}
const storedUser = readStoredUser(storedUserJson);

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

  changePassword: async (newPassword) => {
    try {
      const response = await api.put('/auth/set-password', { newPassword });
      const updatedUser = response.data.user;
      localStorage.setItem('cadence_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Could not update your password. Please try again.') };
    }
  },

  // The saved user can go stale: a role renamed by a migration, or changed by the owner.
  // Fetch the current record so permission checks in the UI match what the API enforces.
  refreshUser: async () => {
    if (!get().token) return;
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      localStorage.setItem('cadence_user', JSON.stringify(user));
      set({ user });
    } catch {
      // 401s are handled by the api interceptor (signs out); anything else keeps the saved user.
    }
  },

  logout: () => {
    localStorage.removeItem('cadence_token');
    localStorage.removeItem('cadence_user');
    set({ token: null, user: null });
  },
}));

// All tabs of one browser share a single sign-in (it lives in localStorage).
// When another tab signs in as someone else or signs out, follow it here and say
// so, rather than carrying on with a stale name on screen and another person's
// session underneath. The page reloads so nothing from the old account lingers.
window.addEventListener('storage', (e) => {
  if (e.key !== 'cadence_token' && e.key !== 'cadence_user' && e.key !== null) return;
  const { user: current } = useAuthStore.getState();
  const nextToken = localStorage.getItem('cadence_token');
  const nextUser = readStoredUser();

  try {
    if (!nextToken) {
      if (!current) return;
      sessionStorage.setItem('cadence_signout_reason', 'elsewhere');
    } else if (nextUser && current && nextUser.id === current.id) {
      // Same person signed in again elsewhere: just pick up the new session quietly.
      useAuthStore.setState({ token: nextToken, user: nextUser });
      return;
    } else if (nextUser) {
      sessionStorage.setItem('cadence_switched_to', nextUser.name);
    } else {
      return; // token written before the user record; the next event has both
    }
  } catch {
    // storage unavailable: still reload so the tab matches the real session
  }
  window.location.reload();
});