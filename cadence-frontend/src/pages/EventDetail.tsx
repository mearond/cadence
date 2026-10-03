import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, Users, UserPlus, Pencil } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DateDisplay from '../components/shared/DateDisplay';
import RatingStars from '../components/shared/RatingStars';
import { fetchEventById, fetchEventRating, type Event, type EventRating } from '../lib/events';
import TimelineTab from '../components/events/TimelineTab';
import BudgetTab from '../components/events/BudgetTab';
import VendorsTab from '../components/events/VendorsTab';
import TasksTab from '../components/events/TasksTab';
import ApprovalsTab from '../components/events/ApprovalsTab';
import InviteClientModal from '../components/events/InviteClientModal';

export default function EventDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'budget' | 'vendors' | 'tasks' | 'approvals'>('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [rating, setRating] = useState<EventRating | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || event?.status !== 'completed') return;
    fetchEventRating(id).then(setRating).catch(() => {});
  }, [id, event?.status]);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-teal-dark/50">...</p>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <p className="text-sm text-red-600">Event not found.</p>
      </DashboardLayout>
    );
  }

  const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark">
          <ArrowLeft size={15} />
          {t('eventDetail.back')}
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/events/${id}/edit`)}
            className="flex items-center gap-1.5 text-sm font-semibold text-teal-deep hover:text-teal-dark"
          >
            <Pencil size={14} />
            {t('eventForm.editTitle')}
          </button>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-1.5 text-sm font-semibold text-teal-deep hover:text-teal-dark">
            <UserPlus size={15} />
            {t('inviteClient.title')}
          </button>
        </div>
      </div>

      <div className="bg-teal-deep rounded-2xl px-7 py-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{displayName}</h1>
        <p className="text-sm text-white/70 capitalize">
          {t(`eventsPage.type.${event.event_type}`)} · {t(`eventsPage.status.${event.status}`)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-sage/30 p-5">
          <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
            <CalendarDays size={13} />
            {t('eventDetail.startDate')}
          </p>
          <p className="text-sm text-teal-dark font-medium">{event.start_date ? <DateDisplay iso={event.start_date} /> : t('eventDetail.notSet')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage/30 p-5">
          <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
            <CalendarDays size={13} />
            {t('eventDetail.endDate')}
          </p>
          <p className="text-sm text-teal-dark font-medium">{event.end_date ? <DateDisplay iso={event.end_date} /> : t('eventDetail.notSet')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage/30 p-5">
          <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
            <Users size={13} />
            {t('eventDetail.guestCount')}
          </p>
          <p className="text-sm text-teal-dark font-medium">{event.guest_count ?? t('eventDetail.notSet')}</p>
        </div>
      </div>

      {event.status === 'completed' && (
        <div className="bg-white rounded-2xl border border-sage/30 p-5 mt-4">
          <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2">{t('rating.clientRating')}</p>
          {rating ? (
            <div className="space-y-1.5">
              <RatingStars value={rating.rating} />
              {rating.comment && <p className="text-sm text-teal-dark/70 italic">"{rating.comment}"</p>}
            </div>
          ) : (
            <p className="text-sm text-teal-dark/40">{t('rating.notRatedYet')}</p>
          )}
        </div>
      )}

      <div className="flex gap-1 mt-6 mb-5 border-b border-sage/30 overflow-x-auto">
        {(['overview', 'timeline', 'budget', 'vendors', 'tasks', 'approvals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab ? 'border-gold text-teal-dark' : 'border-transparent text-teal-dark/40 hover:text-teal-dark/70'
            }`}
          >
            {t(`eventTabs.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && <TimelineTab eventId={id!} />}
      {activeTab === 'budget' && <BudgetTab eventId={id!} />}
      {activeTab === 'vendors' && <VendorsTab eventId={id!} />}
      {activeTab === 'tasks' && <TasksTab eventId={id!} />}
      {activeTab === 'approvals' && <ApprovalsTab eventId={id!} />}

      {showInvite && <InviteClientModal eventId={id!} onClose={() => setShowInvite(false)} />}
    </DashboardLayout>
  );
}