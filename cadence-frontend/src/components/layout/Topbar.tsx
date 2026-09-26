import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut, Languages } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Topbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('cadence_lang', newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
     <header className="h-[72px] bg-teal-deep/5 backdrop-blur-sm border-b border-teal-deep/10 flex items-center justify-between px-8 sticky top-0 z-10">      <div />
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-gold/40 text-teal-dark hover:bg-gold-light/20 transition-colors"
        >
          <Languages size={13} />
          {i18n.language === 'en' ? 'አማርኛ' : 'English'}
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-sage/40">
          <span className="w-8 h-8 rounded-full bg-teal-deep text-white text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
          <span className="text-sm text-teal-dark font-medium hidden sm:block">{user?.name}</span>
        </div>

        <button onClick={handleLogout} className="p-2 text-teal-dark/50 hover:text-gold transition-colors" title={t('nav.logout')}>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}