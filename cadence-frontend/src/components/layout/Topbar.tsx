import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import LanguageToggle from '../shared/LanguageToggle';

const ROLE_KEYS: Record<string, string> = {
  owner: 'staffPage.roleOwner',
  manager: 'staffPage.roleManager',
  coordinator: 'staffPage.roleCoordinator',
  staff: 'staffPage.roleStaff',
};

export default function Topbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 md:h-[72px] flex items-center justify-between gap-3 px-4 md:px-10 sticky top-0 z-30 bg-cream/75 backdrop-blur-xl border-b border-teal-dark/[0.06]">
      <button onClick={() => setMobileNavOpen(true)} className="icon-btn md:hidden w-10 h-10" aria-label={t('nav.menu')}>
        <Menu size={20} />
      </button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageToggle />
        <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:ml-1 sm:border-l border-teal-dark/10">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-deep to-teal-dark text-gold-light text-xs font-semibold grid place-items-center ring-2 ring-paper shadow-sm">
            {initials}
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-teal-dark">{user?.name}</span>
            {user?.role && ROLE_KEYS[user.role] && (
              <span className="text-xs text-teal-dark/50">{t(ROLE_KEYS[user.role])}</span>
            )}
          </span>
        </div>
        <button onClick={handleLogout} className="icon-btn w-9 h-9" title={t('nav.logout')} aria-label={t('nav.logout')}>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
