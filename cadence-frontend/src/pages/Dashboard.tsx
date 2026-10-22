import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Users, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DateDisplay from '../components/shared/DateDisplay';
import EventCalendar from '../components/dashboard/EventCalendar';
import { useAuthStore } from '../store/authStore';
import Tilet from '../components/shared/Tilet';
import CountUp from '../components/shared/CountUp';
import { todayInBothCalendars } from '../lib/today';
import { fetchDashboardSummary, type DashboardSummary } from '../lib/dashboard';

const PIPELINE_COLORS: Record<string, string> = {
  planning: 'bg-gold',
  confirmed: 'bg-sage',
  'in-progress': 'bg-teal-deep',
  completed: 'bg-teal-dark',
  cancelled: 'bg-teal-dark/20',
};

const statusColors: Record<string, string> = {
  planning: 'bg-gold-light/45 text-[#7a5a14]',
  confirmed: 'bg-sage-light text-teal-deep',
  'in-progress': 'bg-teal-deep text-white',
  completed: 'bg-teal-dark text-sage-light',
  cancelled: 'bg-teal-dark/[0.07] text-teal-dark/50',
};

const priorityColors: Record<string, string> = {
  critical: 'bg-terracotta-light text-terracotta',
  high: 'bg-gold-light/60 text-[#8a4a12]',
  medium: 'bg-gold-light/45 text-[#7a5a14]',
  low: 'bg-sage-light text-teal-deep',
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setData)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const today = todayInBothCalendars(i18n.language);
  const upcomingCount = data?.upcomingEvents.length ?? 0;
  const statusOrder = ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'];
  const countsByStatus: Record<string, number> = {};
  data?.statusCounts.forEach((s) => (countsByStatus[s.status] = s.count));

  const total = statusOrder.reduce((sum, st) => sum + (countsByStatus[st] ?? 0), 0);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <DashboardLayout>
      <section className="relative overflow-hidden rounded-3xl bg-teal-ink text-white mb-6 shadow-[0_30px_70px_-34px_rgb(10_40_38/0.9)]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(55% 120% at 100% 0%, rgb(19 95 90 / 0.95), transparent 70%), radial-gradient(40% 80% at 0% 100%, rgb(196 144 45 / 0.22), transparent 70%)',
          }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] items-end px-6 sm:px-10 pt-9 pb-8">
          <div>
            <p className="text-gold-light/90 text-[15px] mb-2">{t('dashboard.greeting', { name: firstName })}</p>
            <h1 className="font-display font-semibold leading-[0.95] text-[clamp(2.4rem,5.5vw,4.25rem)]">
              {today.primary}
            </h1>
            <p className="mt-3 text-white/60">{today.secondary}</p>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-right">
              <p className="font-display text-5xl font-semibold leading-none text-gold-light">
                <CountUp value={upcomingCount} />
              </p>
              <p className="text-sm text-white/60 mt-1.5">{t('dashboard.upcomingCount', { count: upcomingCount })}</p>
            </div>
          </div>
        </div>
        <Tilet size={14} tone="gold" weave />
      </section>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-28 lg:col-span-3" />
          <div className="skeleton h-[420px] lg:col-span-2" />
          <div className="skeleton h-[420px]" />
        </div>
      )}
      {loadError && <p className="card p-5 text-sm text-terracotta">{t('dashboard.loadError')}</p>}

      {!loading && data && (
        <>
          <section className="card p-5 sm:p-6 mb-6" aria-label={t('dashboard.pipeline')}>
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="section-title">{t('dashboard.pipeline')}</h2>
              <p className="text-sm text-teal-dark/50">{t('dashboard.totalEvents', { count: total })}</p>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-teal-dark/[0.06] mb-5">
              {statusOrder.map((status, i) => {
                const n = countsByStatus[status] ?? 0;
                if (!n || !total) return null;
                return (
                  <motion.div
                    key={status}
                    className={`h-full ${PIPELINE_COLORS[status]} first:rounded-l-full last:rounded-r-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / total) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.25 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                );
              })}
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-4">
              {statusOrder.map((status) => (
                <button
                  key={status}
                  onClick={() => navigate('/events')}
                  className="group text-left rounded-xl -m-2 p-2 hover:bg-teal-dark/[0.04] transition-colors"
                >
                  <dt className="flex items-center gap-2 text-sm text-teal-dark/60">
                    <span className={`w-2.5 h-2.5 rounded-full ${PIPELINE_COLORS[status]}`} />
                    {t(`eventsPage.status.${status}`)}
                  </dt>
                  <dd className="font-display text-3xl font-semibold text-teal-dark mt-1">
                    <CountUp value={countsByStatus[status] ?? 0} />
                  </dd>
                </button>
              ))}
            </dl>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EventCalendar events={data.allEvents} />
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="section-title mb-4">
                  {t('dashboard.upcomingEvents')}
                </h2>
                {data.upcomingEvents.length === 0 && (
                  <p className="text-sm text-teal-dark/40">{t('dashboard.noUpcoming')}</p>
                )}
                <div className="divide-y divide-teal-dark/[0.06]">
                  {data.upcomingEvents.map((event) => {
                    const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;
                    return (
                      <button
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="w-full text-left flex items-start justify-between gap-3 rounded-xl -mx-2 px-2 py-2.5 hover:bg-teal-dark/[0.04] transition-colors"
                      >
                        <div>
                          <p className="text-[15px] font-medium text-teal-dark">{displayName}</p>
                          <span className="flex items-center gap-1 text-xs text-teal-dark/50 mt-0.5">
                            <CalendarDays size={11} />
                            <DateDisplay iso={event.start_date} />
                          </span>
                          {event.guest_count != null && event.guest_count > 0 && (
                            <span className="flex items-center gap-1 text-xs text-teal-dark/50 mt-0.5">
                              <Users size={11} />
                              {event.guest_count} {t('eventsPage.guests')}
                            </span>
                          )}
                        </div>
                        <span className={`chip shrink-0 ${statusColors[event.status]}`}>
                          {t(`eventsPage.status.${event.status}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="section-title mb-4 flex items-center gap-1.5">
                  <ClipboardList size={14} />
                  {t('dashboard.pendingTasks')}
                </h2>
                {data.pendingTasks.length === 0 && (
                  <p className="text-sm text-teal-dark/40">{t('dashboard.noPendingTasks')}</p>
                )}
                <div className="divide-y divide-teal-dark/[0.06]">
                  {data.pendingTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => navigate(`/events/${task.event_id}`)}
                      className="w-full text-left flex items-start justify-between gap-3 rounded-xl -mx-2 px-2 py-2.5 hover:bg-teal-dark/[0.04] transition-colors"
                    >
                      <div>
                        <p className="text-[15px] font-medium text-teal-dark">{task.title}</p>
                        <p className="text-xs text-teal-dark/50 mt-0.5">{task.event_name}</p>
                      </div>
                      <span className={`chip shrink-0 ${priorityColors[task.priority] || ''}`}>
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