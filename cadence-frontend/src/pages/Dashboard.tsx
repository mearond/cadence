import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.dashboard')}</h1>
        <button onClick={handleLogout} className="text-sm text-red-600 font-medium">
          {t('nav.logout')}
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-slate-600">
          Logged in as <span className="font-semibold">{user?.name}</span> ({user?.email})
        </p>
        <p className="text-sm text-slate-400 mt-1">Role: {user?.role} — Org ID: {user?.org_id}</p>
      </div>
    </div>
  );
}