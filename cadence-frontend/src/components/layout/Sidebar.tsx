import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, CalendarDays, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const role = useAuthStore((s) => s.user?.role);

  const navItems = [
    { label: t('nav.dashboard'), icon: LayoutGrid, path: '/dashboard' },
    { label: t('nav.events'), icon: CalendarDays, path: '/events' },
  ];

  const operationsItems = [
    { label: t('nav.vendors'), icon: Building2, path: '/vendors' },
    ...(role === 'admin' ? [{ label: t('nav.staff'), icon: Users, path: '/staff' }] : []),
  ];

  const renderLink = ({ label, icon: Icon, path }: { label: string; icon: typeof LayoutGrid; path: string }) => {
    const active = location.pathname.startsWith(path);
    return (
      <Link
        key={path}
        to={path}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
          collapsed ? 'justify-center' : ''
        } ${active ? 'bg-teal-deep text-white shadow-sm' : 'text-teal-dark/70 hover:bg-sage-light'}`}
      >
        <Icon size={17} className="shrink-0" />
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`bg-cream border-r border-sage/40 flex flex-col h-screen sticky top-0 shrink-0 relative transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <button
        onClick={toggleSidebar}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-teal-deep text-white flex items-center justify-center shadow-md border-2 border-cream hover:bg-teal-dark transition-colors z-20"
      >
        {collapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>

      <div className="px-6 py-7 overflow-hidden">
        {collapsed ? (
          <p className="text-teal-deep font-bold text-2xl">C</p>
        ) : (
          <p className="text-teal-deep font-bold text-2xl tracking-tight whitespace-nowrap">{t('app.name')}</p>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(renderLink)}

        <div className="pt-5 mt-5 border-t border-sage/40">
          {!collapsed && <p className="text-[11px] text-teal-dark/40 tracking-wide px-4 mb-2">EVENT OPERATIONS</p>}
          <div className="space-y-1">{operationsItems.map(renderLink)}</div>
        </div>
      </nav>
    </aside>
  );
}