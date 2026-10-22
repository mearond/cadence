import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, Users, Pencil } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Tilet from '../components/shared/Tilet';
import { EVENT_STATUS_CHIP_ON_DARK } from '../lib/statusStyles';
import DashboardLayout from '../components/layout/DashboardLayout';
import DateDisplay from '../components/shared/DateDisplay';
import RatingStars from '../components/shared/RatingStars';
import { fetchEventById, fetchEventRating, type Event, type EventRating } from '../lib/events';
import TimelineTab from '../components/events/TimelineTab';
import BudgetTab from '../components/events/BudgetTab';
import VendorsTab from '../components/events/VendorsTab';
import TasksTab from '../components/events/TasksTab';
import ApprovalsTab from '../components/events/ApprovalsTab';
import OverviewTab from '../components/events/OverviewTab';
import ClientsCard from '../components/events/ClientsCard';
import InviteClientModal from '../components/events/InviteClientModal';
import { useCan, type Permission } from '../lib/permissions';

type Tab = 'overview' | 'timeline' | 'budget' | 'vendors' | 'tasks' | 'approvals';

const TAB_PERMISSIONS: Record<Tab, Permission> = {
  overview: 'events:view',
  timeline: 'timeline:view',
  budget: 'budget:view',
  vendors: 'vendors:view',
  tasks: 'tasks:view',
  approvals: 'approvals:view',
};

export default function EventDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const can = useCan();
  const visibleTabs = (Object.keys(TAB_PERMISSIONS) as Tab[]).filter((tab) => can(TAB_PERMISSIONS[tab]));
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [rating, setRating] = useState<EventRating | null>(null);
  const [clientsRefreshKey, setClientsRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || event?.status !== 'completed') return;
    fetchEventRating(id).then(setRating).catch(() => {});
  }, [id, event?.status]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="skeleton h-10 w-40 mb-5" />
        <div className="skeleton h-56 rounded-3xl" />
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="card p-10 text-center max-w-md mx-auto mt-10">
          <p className="font-display text-xl font-semibold mb-2">{t('eventDetail.notFound')}</p>
          <p className="text-sm text-teal-dark/60 mb-6">{t('eventDetail.notFoundHint')}</p>
          <button onClick={() => navigate('/events')} className="btn-primary">{t('eventDetail.back')}</button>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/events')} className="btn-ghost -ml-3">
          <ArrowLeft size={16} />
          {t('eventDetail.back')}
        </button>
        {can('events:edit') && (
          <button onClick={() => navigate(`/events/${id}/edit`)} className="btn-primary">
            <Pencil size={14} />
            {t('eventForm.editTitle')}
          </button>
        )}
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-teal-deep text-white shadow-[0_24px_60px_-28px_rgb(10_40_38/0.8)]">
        <Tilet size={14} tone="ink" weave />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(70% 90% at 100% 0%, rgb(236 202 131 / 0.18), transparent 60%)' }}
        />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] items-end px-6 sm:px-9 pt-8 pb-9">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`chip ${EVENT_STATUS_CHIP_ON_DARK[event.status] || ''}`}>
                {t(`eventsPage.status.${event.status}`)}
              </span>
              <span className="text-sm text-gold-light/90">{t(`eventsPage.type.${event.event_type}`)}</span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] font-semibold break-words">
              {displayName}
            </h1>
          </div>
          <dl className="flex flex-wrap gap-x-10 gap-y-5 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-white/55 mb-1">
                <CalendarDays size={14} />
                {t('eventDetail.dates')}
              </dt>
              <dd className="font-medium text-white">
                <DateDisplay iso={event.start_date} />
                {event.end_date && event.end_date !== event.start_date && (
                  <span className="block text-white/70">
                    {t('eventDetail.until')} <DateDisplay iso={event.end_date} />
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-white/55 mb-1">
                <Users size={14} />
                {t('eventDetail.guestCount')}
              </dt>
              <dd className="font-display text-2xl font-semibold leading-none">
                {event.guest_count ?? <span className="font-sans text-sm font-medium text-white/60">{t('eventDetail.notSet')}</span>}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {event.status === 'completed' && (
        <div className="card-gold p-5 mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="section-title">{t('rating.clientRating')}</p>
          {rating ? (
            <div className="flex flex-wrap items-center gap-4">
              <RatingStars value={rating.rating} />
              {rating.comment && <p className="text-sm text-teal-dark/70 italic">"{rating.comment}"</p>}
            </div>
          ) : (
            <p className="text-sm text-teal-dark/45">{t('rating.notRatedYet')}</p>
          )}
        </div>
      )}

      {can('clients:view') && (
        <ClientsCard key={clientsRefreshKey} eventId={id!} onAddClick={() => setShowInvite(true)} />
      )}

      <div role="tablist" className="flex gap-1 mt-8 mb-6 border-b border-teal-dark/10 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {visibleTabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 pt-2 pb-3 text-[15px] font-medium whitespace-nowrap transition-colors ${
                active ? 'text-teal-dark' : 'text-teal-dark/45 hover:text-teal-dark/80'
              }`}
            >
              {t(`eventTabs.${tab}`)}
              {active && (
                <motion.span
                  layoutId="event-tab-underline"
                  className="absolute left-2 right-2 -bottom-px h-[3px] rounded-full bg-gold"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'overview' && <OverviewTab eventId={id!} onNavigate={setActiveTab} />}
          {activeTab === 'timeline' && <TimelineTab eventId={id!} />}
          {activeTab === 'budget' && can('budget:view') && <BudgetTab eventId={id!} />}
          {activeTab === 'vendors' && can('vendors:view') && <VendorsTab eventId={id!} />}
          {activeTab === 'tasks' && <TasksTab eventId={id!} />}
          {activeTab === 'approvals' && can('approvals:view') && <ApprovalsTab eventId={id!} />}
        </motion.div>
      </AnimatePresence>

      {showInvite && (
        <InviteClientModal
          eventId={id!}
          onClose={() => {
            setShowInvite(false);
            setClientsRefreshKey((k) => k + 1);
          }}
        />
      )}
    </DashboardLayout>
  );
}