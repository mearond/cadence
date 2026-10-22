import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/shared/PageHeader';
import Tilet from '../components/shared/Tilet';
import EventTypePicker from '../components/events/EventTypePicker';
import { createEvent } from '../lib/events';

export default function NewEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [eventType, setEventType] = useState('conference');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const event = await createEvent({
        name,
        nameAm: nameAm || undefined,
        eventType,
        startDate,
        endDate,
        guestCount: guestCount ? Number(guestCount) : undefined,
      });
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError('Could not create event. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
            <div className="max-w-2xl mx-auto">
        <PageHeader title={t('eventForm.createTitle')} />

                <form onSubmit={handleSubmit} className="stagger-grid relative card overflow-hidden p-6 sm:p-8 pt-9 sm:pt-10 space-y-5">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">{t('eventForm.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Default a single-day event; still editable.
                  if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                }}
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
              disabled={loading}
              className="btn-gold"
            >
              {loading ? '...' : t('eventForm.create')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="btn-ghost"
            >
              {t('eventForm.cancel')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}