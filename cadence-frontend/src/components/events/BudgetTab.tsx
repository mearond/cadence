import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CountUp from '../shared/CountUp';
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
      {summary && (() => {
        const est = Number(summary.total_estimated) || 0;
        const act = Number(summary.total_actual) || 0;
        const pct = est > 0 ? Math.min(100, (act / est) * 100) : act > 0 ? 100 : 0;
        const over = est > 0 && act > est;
        return (
          <div className="card p-6">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-5">
              <div>
                <p className="text-sm text-teal-dark/55 mb-1">{t('budget.totalActual')}</p>
                <p className="font-display text-4xl font-semibold text-teal-dark leading-none">
                  <CountUp value={act} /> <span className="text-xl text-teal-dark/50">ETB</span>
                </p>
              </div>
              <dl className="flex gap-8 text-sm">
                <div>
                  <dt className="text-teal-dark/55">{t('budget.totalEstimated')}</dt>
                  <dd className="font-semibold text-teal-dark mt-0.5">{fmt(summary.total_estimated)}</dd>
                </div>
                <div>
                  <dt className="text-teal-dark/55">{t('budget.totalVat')}</dt>
                  <dd className="font-semibold text-[#8a6416] mt-0.5">{fmt(summary.total_vat)}</dd>
                </div>
              </dl>
            </div>
            <div className="h-2.5 rounded-full bg-teal-dark/[0.07] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${over ? 'bg-terracotta' : 'bg-gradient-to-r from-teal-deep to-gold'}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className={`mt-2.5 text-[13px] ${over ? 'text-terracotta font-medium' : 'text-teal-dark/55'}`}>
              {est > 0
                ? over
                  ? t('budget.overBy', { amount: fmt(String(act - est)) })
                  : t('budget.percentUsed', { percent: Math.round(pct) })
                : t('budget.noEstimate')}
            </p>
          </div>
        );
      })()}

      <div className="card p-6">
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
              <div key={item.id} className="flex items-center justify-between gap-3 py-3 border-b border-teal-dark/[0.06] last:border-0 text-sm group">
                <div>
                  <p className="text-[15px] text-teal-dark font-medium">{item.name}</p>
                  <p className="text-[13px] text-teal-dark/45 capitalize">{item.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-right tabular-nums">
                    <span className="font-semibold text-teal-dark">{fmt(item.actual_amount_etb)}</span>
                    <span className="block text-xs text-teal-dark/45">{t('budget.of')} {fmt(item.estimated_amount_etb)}</span>
                  </p>
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(item)} className="icon-btn w-7 h-7">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="icon-btn-danger w-7 h-7">
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
          <button onClick={startAdd} className="btn-ghost text-teal-deep -ml-3">
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
    <div className="grid grid-cols-2 gap-2 pt-3 pb-2 border-t border-teal-dark/[0.07]">
      <input placeholder={t('budget.category')} value={category} onChange={(e) => setCategory(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      <input placeholder={t('budget.name')} value={name} onChange={(e) => setName(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      <input type="number" placeholder={t('budget.estimated')} value={estimated} onChange={(e) => setEstimated(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      <input type="number" placeholder={t('budget.actual')} value={actual} onChange={(e) => setActual(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      <div className="col-span-2 flex gap-2">
        <button onClick={onSave} className="btn-gold">
          {t('budget.save')}
        </button>
        <button onClick={onCancel} className="text-sm text-teal-dark/50 px-2 py-2">
          {t('vendors.cancel')}
        </button>
      </div>
    </div>
  );
}