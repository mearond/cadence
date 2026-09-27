import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { createEvent } from '../lib/events';

const EVENT_TYPES = ['conference', 'wedding', 'corporate', 'graduation', 'religious', 'memorial'];

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
    setLoading(true);
    try {
      const event = await createEvent({
        name,
        nameAm: nameAm || undefined,
        eventType,
        startDate,
        endDate: endDate || undefined,
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
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-teal-dark mb-6">{t('eventForm.createTitle')}</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-sage/30 p-6 space-y-4">
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
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1.5">{t('eventForm.guestCount')}</label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full border border-sage/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gold text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gold/90 disabled:opacity-50"
            >
              {loading ? '...' : t('eventForm.create')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="text-sm text-teal-dark/60 px-4 py-2.5"
            >
              {t('eventForm.cancel')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}