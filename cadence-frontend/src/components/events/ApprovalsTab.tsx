import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { fetchApprovals, createApprovalRequest, deleteApprovalRequest, type ApprovalRequest } from '../../lib/events';

const statusColors: Record<string, string> = {
  pending: 'bg-gold-light/40 text-[#8a6a1f]',
  approved: 'bg-sage-light text-teal-dark',
  changes_requested: 'bg-red-100 text-red-600',
};

export default function ApprovalsTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [adding, setAdding] = useState(false);
  const [itemType, setItemType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const load = () => fetchApprovals(eventId).then(setApprovals);

  useEffect(() => {
    load();
  }, [eventId]);

  const handleAdd = async () => {
    if (!itemType.trim() || !title.trim()) return;
    await createApprovalRequest(eventId, {
      itemType: itemType.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setItemType('');
    setTitle('');
    setDescription('');
    setAdding(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this approval request?')) return;
    await deleteApprovalRequest(eventId, id);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      {approvals.length === 0 && !adding && <p className="text-sm text-teal-dark/50 mb-4">{t('approvals.empty')}</p>}

      <div className="space-y-3 mb-4">
        {approvals.map((a) => (
          <div key={a.id} className="border border-sage/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-semibold text-teal-dark text-sm">{a.title}</p>
                <p className="text-[11px] text-teal-dark/40 uppercase">{a.item_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[a.status]}`}>
                  {t(`approvals.status.${a.status}`)}
                </span>
                {a.status === 'pending' && (
                  <button onClick={() => handleDelete(a.id)} className="text-teal-dark/30 hover:text-terracotta p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            {a.description && <p className="text-xs text-teal-dark/60 mt-1">{a.description}</p>}
            {a.client_comment && <p className="text-xs text-teal-dark/50 italic mt-2">"{a.client_comment}"</p>}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="space-y-2 pt-3 border-t border-sage/20">
          <input
            placeholder={t('approvals.itemType')}
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="w-full border border-sage/40 rounded-lg px-2.5 py-2 text-sm"
          />
          <input
            placeholder={t('approvals.formTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-sage/40 rounded-lg px-2.5 py-2 text-sm"
          />
          <textarea
            placeholder={t('approvals.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-sage/40 rounded-lg px-2.5 py-2 text-sm resize-none"
          />
          <button onClick={handleAdd} className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">
            {t('approvals.save')}
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
          <Plus size={15} />
          {t('approvals.add')}
        </button>
      )}
    </div>
  );
}