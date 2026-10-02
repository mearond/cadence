import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { createVendor, fetchVendorCategories, type VendorCategory } from '../../lib/events';
import { isValidEmail, sanitizePhoneInput } from '../../lib/validation';

export default function VendorFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (email.trim() && !isValidEmail(email)) {
      setError(t('vendors.invalidEmail'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createVendor({
        name: name.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        tinNumber: tinNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch {
      setError(t('vendors.createError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage/30">
          <h2 className="text-lg font-bold text-teal-dark">{t('vendors.createTitle')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sage-light text-teal-dark/50">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('vendors.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('vendors.category')}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t('vendors.categoryNone')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {i18n.language === 'am' ? c.name_am : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('vendors.phone')}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                inputMode="numeric"
                maxLength={15}
                className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('vendors.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('vendors.tin')}</label>
            <input value={tinNumber} onChange={(e) => setTinNumber(e.target.value)} className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('vendors.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium text-teal-dark/60 hover:bg-sage-light">
              {t('vendors.cancel')}
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-full text-sm font-semibold bg-gold text-white hover:bg-gold/90 disabled:opacity-50">
              {saving ? '...' : t('vendors.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}