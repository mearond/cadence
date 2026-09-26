import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <DashboardLayout>
      <div className="bg-teal-deep rounded-2xl px-7 py-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{t('nav.dashboard')}</h1>
        <p className="text-sm text-white/70">
            {t('dashboard.welcomeBack')}, {user?.name}.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage/30 max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <p className="text-xs font-semibold text-teal-dark/50 uppercase tracking-wide">
            {t('dashboard.orgId')} #{user?.org_id}
          </p>
        </div>
        <p className="text-sm text-teal-dark">
          {t('dashboard.role')}: <span className="font-semibold capitalize">{user?.role}</span>
        </p>
      </div>
    </DashboardLayout>
  );
}