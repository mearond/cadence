import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fetchEventById, updateEvent } from '../lib/events';

const EVENT_TYPES = ['conference', 'wedding', 'corporate', 'graduation', 'religious', 'memorial'];
const STATUSES = ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'];

export default function EditEvent() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [eventType, setEventType] = useState('conference');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id).then((event) => {
      setName(event.name);
      setNameAm(event.name_am || '');
      setEventType(event.event_type);
      setStatus(event.status);
      setStartDate(event.start_date?.slice(0, 10) || '');
      setEndDate(event.end_date?.slice(0, 10) || '');
      setGuestCount(event.guest_count != null ? String(event.guest_count) : '');
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (endDate && startDate && endDate < startDate) {
      setError('End date cannot be before the start date.');
      return;
    }
    if (guestCount && Number(guestCount) < 0) {
      setError('Guest count cannot be negative.');
      return;
    }

    setSaving(true);
    try {
      await updateEvent(Number(id), {
        name,
        nameAm: nameAm || undefined,
        eventType,
        status,
        startDate,
        endDate: endDate || undefined,
        guestCount: guestCount ? Number(guestCount) : undefined,
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError('Could not update event. Please check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-teal-dark/50">...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-teal-dark mb-6 text-center">{t('eventForm.editTitle')}</h1>

        <form onSubmit={handleSubmit} className="bg-sage-light/40 rounded-3xl border border-sage/30 p-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.nameAm')}</label>
            <input
              value={nameAm}
              onChange={(e) => setNameAm(e.target.value)}
              className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.eventType')}</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`eventsPage.type.${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`eventsPage.status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.endDate')}</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.guestCount')}</label>
            <input
              type="number"
              min={0}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gold text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gold/90 disabled:opacity-50"
            >
              {saving ? '...' : t('eventForm.save')}
            </button>
            <button type="button" onClick={() => navigate(`/events/${id}`)} className="text-sm text-teal-dark/60 px-4 py-2.5">
              {t('eventForm.cancel')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}