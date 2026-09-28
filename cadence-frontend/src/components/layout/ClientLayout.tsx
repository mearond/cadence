import { useTranslation } from 'react-i18next';
import { Languages, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const otherLang = i18n.language === 'am' ? 'EN' : 'አማ';

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-teal-deep/5 border-b border-teal-deep/10 px-6 py-4 flex items-center justify-between">
        <p className="text-teal-deep font-bold text-lg">{t('app.name')}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')}
            className="flex items-center gap-1.5 text-sm text-teal-dark/60 hover:text-teal-dark"
          >
            <Languages size={15} />
            {otherLang}
          </button>
          <span className="text-sm text-teal-dark/70">{user?.name}</span>
          <button onClick={logout} className="text-teal-dark/50 hover:text-terracotta">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}