import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, CalendarDays, Building2, Users, ChevronLeft, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCan } from '../../lib/permissions';
import Tilet from '../shared/Tilet';

type NavItem = { label: string; icon: typeof LayoutGrid; path: string };

function NavLinks({ collapsed, layoutGroup }: { collapsed: boolean; layoutGroup: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const can = useCan();

  const main: NavItem[] = [
    { label: t('nav.dashboard'), icon: LayoutGrid, path: '/dashboard' },
    { label: t('nav.events'), icon: CalendarDays, path: '/events' },
  ];
  const operations: NavItem[] = [
    ...(can('vendors:view') ? [{ label: t('nav.vendors'), icon: Building2, path: '/vendors' }] : []),
    ...(can('staff:view') ? [{ label: t('nav.staff'), icon: Users, path: '/staff' }] : []),
  ];

  const renderLink = ({ label, icon: Icon, path }: NavItem) => {
    const active = location.pathname.startsWith(path);
    return (
      <Link
        key={path}
        to={path}
        title={collapsed ? label : undefined}
        aria-current={active ? 'page' : undefined}
        className={`relative flex items-center gap-3 h-11 rounded-xl text-[14.5px] font-medium transition-colors ${
          collapsed ? 'justify-center px-0' : 'px-3.5'
        } ${active ? 'text-teal-ink' : 'text-white/65 hover:text-white hover:bg-white/[0.06]'}`}
      >
        {active && (
          <motion.span
            layoutId={`nav-active-${layoutGroup}`}
            className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold-light to-gold shadow-[0_8px_20px_-10px_rgb(196_144_45/0.9)]"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        )}
        <Icon size={18} className="relative shrink-0" strokeWidth={active ? 2.2 : 1.8} />
        {!collapsed && <span className="relative whitespace-nowrap">{label}</span>}
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-3 pb-6 space-y-1">
      {main.map(renderLink)}
      {operations.length > 0 && (
        <div className="pt-5 mt-5 border-t border-white/10 space-y-1">
          {!collapsed && <p className="text-xs text-white/40 px-3.5 mb-2">{t('nav.operations')}</p>}
          {operations.map(renderLink)}
        </div>
      )}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  return (
    <Link to="/dashboard" className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-3'}`}>
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-gold-light to-gold text-teal-ink font-display font-bold text-lg shrink-0">
        C
      </span>
      {!collapsed && (
        <span className="font-display font-semibold text-[22px] tracking-tight text-white">{t('app.name')}</span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const mobileOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUIStore((s) => s.setMobileNavOpen);
  const location = useLocation();

  // Close the phone menu after navigating.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 248 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="hidden md:flex relative z-40 flex-col h-screen sticky top-0 shrink-0 bg-teal-ink text-white"
      >
        <div className="py-6">
          <Brand collapsed={collapsed} />
        </div>
        <NavLinks collapsed={collapsed} layoutGroup="desktop" />
        <div className="absolute top-0 right-0 h-full">
          <Tilet vertical size={10} tone="ink" weave />
        </div>
        {/* Round arrow on the sidebar's edge, halfway down, to collapse or expand it. */}
        <motion.button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-8 h-8 rounded-full bg-gradient-to-b from-gold-light to-gold text-teal-ink shadow-[0_6px_16px_-6px_rgb(10_40_38/0.7)] ring-4 ring-cream"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="grid place-items-center">
            <ChevronLeft size={16} strokeWidth={2.6} />
          </motion.span>
        </motion.button>
      </motion.aside>

      {/* Phone: slides over the page */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <motion.div
              className="absolute inset-0 bg-teal-ink/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[272px] max-w-[85vw] flex flex-col bg-teal-ink text-white"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <div className="py-6 flex items-center justify-between pr-4">
                <Brand collapsed={false} />
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-white/60 hover:text-white" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <NavLinks collapsed={false} layoutGroup="mobile" />
              <div className="absolute top-0 right-0 h-full">
                <Tilet vertical size={10} tone="ink" />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
