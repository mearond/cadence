import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, CalendarDays } from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t('nav.dashboard'), icon: LayoutGrid, path: '/dashboard' },
    { label: t('nav.events'), icon: CalendarDays, path: '/events' },
  ];

  return (
    <aside className="w-60 bg-cream border-r border-sage/40 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-6 py-7">
        <p className="text-teal-deep font-bold text-2xl tracking-tight">{t('app.name')}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-deep text-white shadow-sm'
                  : 'text-teal-dark/70 hover:bg-sage-light'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5">
        <div className="h-px bg-sage/40 mb-4" />
        <p className="text-[11px] text-teal-dark/40 tracking-wide">EVENT OPERATIONS</p>
      </div>
    </aside>
  );
}