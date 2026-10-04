import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, X } from 'lucide-react';
import { fetchEventClients, removeEventClient, type EventClient } from '../../lib/events';

export default function ClientsCard({ eventId, onAddClick }: { eventId: string; onAddClick: () => void }) {
  const { t } = useTranslation();
  const [clients, setClients] = useState<EventClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetchEventClients(eventId)
      .then(setClients)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleRemove = async (clientId: number) => {
    if (!window.confirm(t('clients.confirmRemove'))) return;
    setRemovingId(clientId);
    try {
      await removeEventClient(eventId, clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch {
      window.alert(t('clients.removeError'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-teal-dark/50 uppercase">{t('clients.title')}</p>
        <button onClick={onAddClick} className="flex items-center gap-1.5 text-xs font-semibold text-teal-deep hover:text-teal-dark">
          <UserPlus size={13} />
          {t('clients.addNew')}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-teal-dark/40">...</p>
      ) : clients.length === 0 ? (
        <p className="text-sm text-teal-dark/40">{t('clients.empty')}</p>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between gap-2 bg-sage-light/40 rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-teal-dark truncate">{client.name}</p>
                <p className="text-xs text-teal-dark/50 truncate">{client.email}</p>
              </div>
              <button
                onClick={() => handleRemove(client.id)}
                disabled={removingId === client.id}
                className="p-1 rounded-lg hover:bg-white text-teal-dark/40 hover:text-red-600 shrink-0 disabled:opacity-50"
                title={t('clients.remove')}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}