import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Users, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DateDisplay from '../components/shared/DateDisplay';
import EventCalendar from '../components/dashboard/EventCalendar';
import { useAuthStore } from '../store/authStore';
import { fetchDashboardSummary, type DashboardSummary } from '../lib/dashboard';

const statusColors: Record<string, string> = {
  planning: 'bg-gold-light/40 text-[#8a6a1f]',
  confirmed: 'bg-sage-light text-teal-dark',
  'in-progress': 'bg-teal-deep/10 text-teal-deep',
  completed: 'bg-sage text-white',
  cancelled: 'bg-red-100 text-red-600',
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-600',
  high: 'bg-terracotta/15 text-terracotta',
  medium: 'bg-gold-light/40 text-[#8a6a1f]',
  low: 'bg-sage-light text-teal-dark',
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary().then(setData).finally(() => setLoading(false));
  }, []);

  const statusOrder = ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'];
  const countsByStatus: Record<string, number> = {};
  data?.statusCounts.forEach((s) => (countsByStatus[s.status] = s.count));

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-teal-deep rounded-2xl px-7 py-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-white mb-1">{t('nav.dashboard')}</h1>
        <p className="text-sm text-white/70">
          {t('dashboard.welcomeBack')}, {user?.name}.
        </p>
      </motion.div>

      {loading && <p className="text-sm text-teal-dark/50">...</p>}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {statusOrder.map((status) => (
              <div key={status} className="bg-white rounded-2xl border border-sage/30 p-4">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                  {t(`eventsPage.status.${status}`)}
                </span>
                <p className="text-2xl font-bold text-teal-dark mt-2">{countsByStatus[status] ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EventCalendar events={data.allEvents} />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-sage/30 p-6">
                <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide mb-4">
                  {t('dashboard.upcomingEvents')}
                </h2>
                {data.upcomingEvents.length === 0 && (
                  <p className="text-sm text-teal-dark/40">{t('dashboard.noUpcoming')}</p>
                )}
                <div className="space-y-3">
                  {data.upcomingEvents.map((event) => {
                    const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;
                    return (
                      <button
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="w-full text-left flex items-start justify-between gap-2 pb-3 border-b border-sage/20 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-teal-dark">{displayName}</p>
                          <span className="flex items-center gap-1 text-xs text-teal-dark/50 mt-0.5">
                            <CalendarDays size={11} />
                            <DateDisplay iso={event.start_date} />
                          </span>
                          {event.guest_count && (
                            <span className="flex items-center gap-1 text-xs text-teal-dark/50 mt-0.5">
                              <Users size={11} />
                              {event.guest_count} {t('eventsPage.guests')}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[event.status]}`}>
                          {t(`eventsPage.status.${event.status}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-sage/30 p-6">
                <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <ClipboardList size={14} />
                  {t('dashboard.pendingTasks')}
                </h2>
                {data.pendingTasks.length === 0 && (
                  <p className="text-sm text-teal-dark/40">{t('dashboard.noPendingTasks')}</p>
                )}
                <div className="space-y-3">
                  {data.pendingTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/events/${task.event_id}`)}
                      className="w-full text-left flex items-start justify-between gap-2 pb-3 border-b border-sage/20 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-teal-dark">{task.title}</p>
                        <p className="text-xs text-teal-dark/50 mt-0.5">{task.event_name}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${priorityColors[task.priority] || ''}`}>
                        {t(`dashboard.priority.${task.priority}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}