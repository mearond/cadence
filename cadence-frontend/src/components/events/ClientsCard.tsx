import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, X } from 'lucide-react';
import { fetchEventClients, removeEventClient, type EventClient } from '../../lib/events';
import { useCan } from '../../lib/permissions';

export default function ClientsCard({ eventId, onAddClick }: { eventId: string; onAddClick: () => void }) {
  const { t } = useTranslation();
  const canManage = useCan()('clients:manage');
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
    <div className="card p-5 mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title">{t('clients.title')}</p>
        {canManage && (
          <button onClick={onAddClick} className="btn-ghost text-teal-deep">
            <UserPlus size={13} />
            {t('clients.addNew')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="skeleton h-12 w-64" />
      ) : clients.length === 0 ? (
        <p className="text-sm text-teal-dark/40">{t('clients.empty')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center gap-3 bg-sage-light/60 rounded-full pl-1.5 pr-2 py-1.5">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-teal-deep text-gold-light text-xs font-semibold shrink-0">{client.name.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-teal-dark truncate">{client.name}</p>
                <p className="text-xs text-teal-dark/50 truncate">{client.email}</p>
              </div>
              {canManage && (
              <button
                onClick={() => handleRemove(client.id)}
                disabled={removingId === client.id}
                className="icon-btn-danger w-7 h-7 shrink-0 disabled:opacity-50"
                title={t('clients.remove')}
              >
                <X size={14} />
              </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}