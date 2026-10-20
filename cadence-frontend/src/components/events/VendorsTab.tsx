import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import {
  fetchEventVendors,
  fetchAllVendors,
  bookVendor,
  updateEventVendor,
  PAYMENT_STATUSES,
  type PaymentStatus,
} from '../../lib/events';
import { useCan } from '../../lib/permissions';

const statusColors: Record<PaymentStatus, string> = {
  unpaid: 'bg-red-100 text-red-600',
  partial: 'bg-gold-light/40 text-[#8a6a1f]',
  paid: 'bg-sage-light text-teal-dark',
};

export default function VendorsTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const can = useCan();
  const canManage = can('vendors:manage');
  const [booked, setBooked] = useState<any[]>([]);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('unpaid');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => fetchEventVendors(eventId).then(setBooked);
  const loadVendors = () => fetchAllVendors().then(setAllVendors);

  useEffect(() => {
    load();
    if (canManage) loadVendors();
  }, [eventId, canManage]);

  const handleAdd = async () => {
    if (!vendorId) return;
    await bookVendor(eventId, { vendorId: Number(vendorId), contractAmountEtb: Number(amount) || 0, paymentStatus: status });
    setVendorId(''); setAmount(''); setStatus('unpaid'); setAdding(false);
    load();
  };

  const handleStatusChange = async (bookingId: number, paymentStatus: PaymentStatus) => {
    setError('');
    setSavingId(bookingId);
    const previous = booked;
    // Update immediately so the dropdown doesn't snap back while saving.
    setBooked((prev) => prev.map((v) => (v.id === bookingId ? { ...v, payment_status: paymentStatus } : v)));
    try {
      await updateEventVendor(eventId, bookingId, { paymentStatus });
    } catch {
      setBooked(previous);
      setError(t('vendors.updateError'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-teal-dark/40 uppercase tracking-wide">{t('vendors.booked')}</p>
        {canManage && (
          <button
            onClick={() => navigate('/vendors')}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-deep hover:text-teal-dark"
          >
            <Building2 size={13} />
            {t('vendors.manageVendors')}
          </button>
        )}
      </div>

      {booked.length === 0 && !adding && <p className="text-sm text-teal-dark/50 mb-4">{t('vendors.empty')}</p>}
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="space-y-2 mb-4">
        {booked.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-3 py-2 border-b border-sage/20 last:border-0 text-sm">
            <p className="text-teal-dark font-medium truncate">{v.vendor_name}</p>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-teal-dark/60">{Number(v.contract_amount_etb).toLocaleString()} ETB</span>
              {canManage ? (
                <select
                  value={v.payment_status}
                  disabled={savingId === v.id}
                  onChange={(e) => handleStatusChange(v.id, e.target.value as PaymentStatus)}
                  aria-label={t('vendors.paymentStatus')}
                  className={`text-xs font-semibold pl-2 pr-1 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50 ${statusColors[v.payment_status as PaymentStatus] ?? ''}`}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{t(`vendors.status.${s}`)}</option>
                  ))}
                </select>
              ) : (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[v.payment_status as PaymentStatus] ?? ''}`}>
                  {t(`vendors.status.${v.payment_status}`)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!canManage ? null : adding ? (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-sage/20">
          <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm">
            <option value="">{t('vendors.name')}</option>
            {allVendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input type="number" min={0} placeholder={t('vendors.amount')} value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm col-span-2">
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`vendors.status.${s}`)}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="col-span-2 bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">{t('vendors.save')}</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
          <Plus size={15} />{t('vendors.add')}
        </button>
      )}
    </div>
  );
}
