import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, Users } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fetchEventById, type Event } from '../lib/events';

export default function EventDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : t('eventDetail.notSet');

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
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark mb-4"
      >
        <ArrowLeft size={15} />
        {t('eventDetail.back')}
      </button>

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
          <p className="text-sm text-teal-dark font-medium">{formatDate(event.start_date)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage/30 p-5">
          <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
            <CalendarDays size={13} />
            {t('eventDetail.endDate')}
          </p>
          <p className="text-sm text-teal-dark font-medium">{formatDate(event.end_date)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage/30 p-5">
          <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
            <Users size={13} />
            {t('eventDetail.guestCount')}
          </p>
          <p className="text-sm text-teal-dark font-medium">{event.guest_count ?? t('eventDetail.notSet')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}