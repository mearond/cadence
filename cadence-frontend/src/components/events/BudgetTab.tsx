import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { fetchBudgetItems, fetchBudgetSummary, addBudgetItem } from '../../lib/events';

export default function BudgetTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [estimated, setEstimated] = useState('');
  const [actual, setActual] = useState('');

  const load = () => {
    fetchBudgetItems(eventId).then(setItems);
    fetchBudgetSummary(eventId).then(setSummary);
  };

  useEffect(() => { load(); }, [eventId]);

  const handleAdd = async () => {
    if (!category || !name) return;
    await addBudgetItem(eventId, {
      category, name,
      estimatedAmountEtb: Number(estimated) || 0,
      actualAmountEtb: Number(actual) || 0,
    });
    setCategory(''); setName(''); setEstimated(''); setActual(''); setAdding(false);
    load();
  };

  const fmt = (n: string) => `${Number(n).toLocaleString()} ETB`;

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-sage/30 p-4">
            <p className="text-xs text-teal-dark/50 mb-1">{t('budget.totalEstimated')}</p>
            <p className="text-lg font-bold text-teal-dark">{fmt(summary.total_estimated)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-sage/30 p-4">
            <p className="text-xs text-teal-dark/50 mb-1">{t('budget.totalActual')}</p>
            <p className="text-lg font-bold text-teal-dark">{fmt(summary.total_actual)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gold/30 p-4">
            <p className="text-xs text-teal-dark/50 mb-1">{t('budget.totalVat')}</p>
            <p className="text-lg font-bold text-gold">{fmt(summary.total_vat)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-sage/30 p-6">
        {items.length === 0 && !adding && <p className="text-sm text-teal-dark/50 mb-4">{t('budget.empty')}</p>}

        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-sage/20 last:border-0 text-sm">
              <div>
                <p className="text-teal-dark font-medium">{item.name}</p>
                <p className="text-xs text-teal-dark/40">{item.category}</p>
              </div>
              <p className="text-teal-dark/70">{fmt(item.actual_amount_etb)}</p>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-sage/20">
            <input placeholder={t('budget.category')} value={category} onChange={(e) => setCategory(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
            <input placeholder={t('budget.name')} value={name} onChange={(e) => setName(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
            <input type="number" placeholder={t('budget.estimated')} value={estimated} onChange={(e) => setEstimated(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
            <input type="number" placeholder={t('budget.actual')} value={actual} onChange={(e) => setActual(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
            <button onClick={handleAdd} className="col-span-2 bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">{t('budget.save')}</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
            <Plus size={15} />{t('budget.add')}
          </button>
        )}
      </div>
    </div>
  );
}