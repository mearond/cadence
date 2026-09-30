import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchBudgetItems, fetchBudgetSummary, addBudgetItem, updateBudgetItem, deleteBudgetItem } from '../../lib/events';

interface BudgetItem {
  id: number;
  category: string;
  name: string;
  estimated_amount_etb: string;
  actual_amount_etb: string;
}

export default function BudgetTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [formMode, setFormMode] = useState<'none' | 'add' | number>('none');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [estimated, setEstimated] = useState('');
  const [actual, setActual] = useState('');

  const load = () => {
    fetchBudgetItems(eventId).then(setItems);
    fetchBudgetSummary(eventId).then(setSummary);
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const resetForm = () => {
    setCategory('');
    setName('');
    setEstimated('');
    setActual('');
    setFormMode('none');
  };

  const startAdd = () => {
    setCategory('');
    setName('');
    setEstimated('');
    setActual('');
    setFormMode('add');
  };

  const startEdit = (item: BudgetItem) => {
    setCategory(item.category);
    setName(item.name);
    setEstimated(String(item.estimated_amount_etb));
    setActual(String(item.actual_amount_etb));
    setFormMode(item.id);
  };

  const handleSave = async () => {
    if (!category || !name) return;
    const data = {
      category,
      name,
      estimatedAmountEtb: Number(estimated) || 0,
      actualAmountEtb: Number(actual) || 0,
    };
    if (formMode === 'add') {
      await addBudgetItem(eventId, data);
    } else if (typeof formMode === 'number') {
      await updateBudgetItem(eventId, formMode, data);
    }
    resetForm();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this budget item?')) return;
    await deleteBudgetItem(eventId, id);
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
        {items.length === 0 && formMode === 'none' && <p className="text-sm text-teal-dark/50 mb-4">{t('budget.empty')}</p>}

        <div className="space-y-1 mb-4">
          {items.map((item) =>
            formMode === item.id ? (
              <BudgetForm
                key={item.id}
                t={t}
                category={category}
                setCategory={setCategory}
                name={name}
                setName={setName}
                estimated={estimated}
                setEstimated={setEstimated}
                actual={actual}
                setActual={setActual}
                onSave={handleSave}
                onCancel={resetForm}
              />
            ) : (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-sage/20 last:border-0 text-sm group">
                <div>
                  <p className="text-teal-dark font-medium">{item.name}</p>
                  <p className="text-xs text-teal-dark/40">{item.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-teal-dark/70">{fmt(item.actual_amount_etb)}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(item)} className="text-teal-dark/40 hover:text-teal-deep p-1">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-teal-dark/40 hover:text-terracotta p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {formMode === 'add' ? (
          <BudgetForm
            t={t}
            category={category}
            setCategory={setCategory}
            name={name}
            setName={setName}
            estimated={estimated}
            setEstimated={setEstimated}
            actual={actual}
            setActual={setActual}
            onSave={handleSave}
            onCancel={resetForm}
          />
        ) : formMode === 'none' ? (
          <button onClick={startAdd} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
            <Plus size={15} />
            {t('budget.add')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BudgetForm({
  t,
  category,
  setCategory,
  name,
  setName,
  estimated,
  setEstimated,
  actual,
  setActual,
  onSave,
  onCancel,
}: {
  t: (key: string) => string;
  category: string;
  setCategory: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  estimated: string;
  setEstimated: (v: string) => void;
  actual: string;
  setActual: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 pt-3 pb-2 border-t border-sage/20">
      <input placeholder={t('budget.category')} value={category} onChange={(e) => setCategory(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      <input placeholder={t('budget.name')} value={name} onChange={(e) => setName(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      <input type="number" placeholder={t('budget.estimated')} value={estimated} onChange={(e) => setEstimated(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      <input type="number" placeholder={t('budget.actual')} value={actual} onChange={(e) => setActual(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      <div className="col-span-2 flex gap-2">
        <button onClick={onSave} className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">
          {t('budget.save')}
        </button>
        <button onClick={onCancel} className="text-sm text-teal-dark/50 px-2 py-2">
          {t('vendors.cancel')}
        </button>
      </div>
    </div>
  );
}