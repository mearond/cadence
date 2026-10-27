import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cadence_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired or revoked token makes every request fail. Sign out and send the
// person to the login page instead of leaving pages stuck on errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/signup');
    if (status === 401 && !isAuthAttempt && localStorage.getItem('cadence_token')) {
      // Tell the sign-in page why, so it can explain instead of just reappearing.
      const reason = error.response?.data?.code === 'ACCOUNT_REMOVED' ? 'removed' : 'expired';
      try {
        sessionStorage.setItem('cadence_signout_reason', reason);
      } catch {
        // storage unavailable: the sign-in page just won't show a reason
      }
      localStorage.removeItem('cadence_token');
      localStorage.removeItem('cadence_user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;