import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Tilet from '../shared/Tilet';
import LanguageToggle from '../shared/LanguageToggle';

// Frame for the client portal: a slim ink header with the woven band beneath it.
export default function ClientLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-teal-ink text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/portal')} className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light to-gold text-teal-ink font-display font-bold">
              C
            </span>
            <span className="font-display font-semibold text-lg tracking-tight">{t('app.name')}</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle dark />
            <span className="hidden sm:block text-sm text-white/75">{user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="grid place-items-center w-9 h-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('nav.logout')}
              title={t('nav.logout')}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
        <Tilet size={10} tone="ink" weave />
      </header>
      <main className="stagger max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}
