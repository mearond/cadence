import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { fetchEventVendors, fetchAllVendors, bookVendor } from '../../lib/events';

export default function VendorsTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [booked, setBooked] = useState<any[]>([]);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('unpaid');

  const load = () => fetchEventVendors(eventId).then(setBooked);

  useEffect(() => {
    load();
    fetchAllVendors().then(setAllVendors);
  }, [eventId]);

  const handleAdd = async () => {
    if (!vendorId) return;
    await bookVendor(eventId, { vendorId: Number(vendorId), contractAmountEtb: Number(amount) || 0, paymentStatus: status });
    setVendorId(''); setAmount(''); setStatus('unpaid'); setAdding(false);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      {booked.length === 0 && !adding && <p className="text-sm text-teal-dark/50 mb-4">{t('vendors.empty')}</p>}

      <div className="space-y-2 mb-4">
        {booked.map((v) => (
          <div key={v.id} className="flex items-center justify-between py-2 border-b border-sage/20 last:border-0 text-sm">
            <p className="text-teal-dark font-medium">{v.vendor_name}</p>
            <div className="flex items-center gap-3">
              <span className="text-teal-dark/60">{Number(v.contract_amount_etb).toLocaleString()} ETB</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sage-light text-teal-dark">
                {t(`vendors.status.${v.payment_status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-sage/20">
          <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm">
            <option value="">{t('vendors.name')}</option>
            {allVendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input type="number" placeholder={t('vendors.amount')} value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm col-span-2">
            <option value="unpaid">{t('vendors.status.unpaid')}</option>
            <option value="partial">{t('vendors.status.partial')}</option>
            <option value="paid">{t('vendors.status.paid')}</option>
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