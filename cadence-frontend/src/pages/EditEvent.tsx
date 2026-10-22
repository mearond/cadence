import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/shared/PageHeader';
import Tilet from '../components/shared/Tilet';
import EventTypePicker from '../components/events/EventTypePicker';
import { fetchEventById, updateEvent, MANUAL_STATUSES } from '../lib/events';

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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchEventById(id).then((event) => {
      setName(event.name);
      setNameAm(event.name_am || '');
      setEventType(event.event_type);
      setStatus(event.manual_status ?? 'planning');
      setStartDate(event.start_date?.slice(0, 10) || '');
      setEndDate(event.end_date?.slice(0, 10) || '');
      setGuestCount(event.guest_count != null ? String(event.guest_count) : '');
    })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError(t('eventForm.datesRequired'));
      return;
    }
    if (endDate < startDate) {
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
        endDate,
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
        <div className="max-w-2xl mx-auto skeleton h-96" />
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <p className="card p-6 text-sm text-terracotta">{t('eventDetail.notFound')}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <PageHeader title={t('eventForm.editTitle')} />

        <form onSubmit={handleSubmit} className="relative card overflow-hidden p-6 sm:p-8 pt-9 sm:pt-10 space-y-5">
          <div className="absolute inset-x-0 top-0">
            <Tilet size={9} weave />
          </div>
          <div>
            <label className="field-label">{t('eventForm.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="field-label">{t('eventForm.nameAm')}</label>
            <input
              value={nameAm}
              onChange={(e) => setNameAm(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="field-label">{t('eventForm.eventType')}</label>
            <EventTypePicker value={eventType} onChange={setEventType} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('eventForm.status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                {MANUAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`eventsPage.status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[13px] text-teal-dark/50 -mt-3">{t('eventForm.statusHint')}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('eventForm.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="field-label">{t('eventForm.endDate')}</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label">{t('eventForm.guestCount')}</label>
            <input
              type="number"
              min={0}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-terracotta bg-terracotta-light/70 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-3 border-t border-teal-dark/[0.07] mt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-gold"
            >
              {saving ? '...' : t('eventForm.save')}
            </button>
            <button type="button" onClick={() => navigate(`/events/${id}`)} className="btn-ghost">
              {t('eventForm.cancel')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}