import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { useTranslation } from 'react-i18next';
import { createVendor, updateVendor, fetchVendorCategories, type Vendor, type VendorCategory } from '../../lib/events';
import { isValidEmail, sanitizePhoneInput } from '../../lib/validation';

export default function VendorFormModal({
  vendor,
  onClose,
  onCreated,
}: {
  vendor?: Vendor | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isEdit = !!vendor;
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [name, setName] = useState(vendor?.name ?? '');
  const [categoryId, setCategoryId] = useState(vendor?.category_id ? String(vendor.category_id) : '');
  const [phone, setPhone] = useState(vendor?.phone ?? '');
  const [email, setEmail] = useState(vendor?.email ?? '');
  const [tinNumber, setTinNumber] = useState(vendor?.tin_number ?? '');
  const [notes, setNotes] = useState(vendor?.notes ?? '');
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
      const payload = {
        name: name.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        tinNumber: tinNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEdit && vendor) {
        await updateVendor(vendor.id, payload);
      } else {
        await createVendor(payload);
      }
      onCreated();
      onClose();
    } catch {
      setError(isEdit ? t('vendors.updateError') : t('vendors.createError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? t('vendors.editTitle') : t('vendors.createTitle')} onClose={onClose} width="md">

        <form onSubmit={handleSubmit} className="px-6 pt-2 pb-6 space-y-4">
          <div>
            <label className="field-label">{t('vendors.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-sm"
            />
          </div>

          <div>
            <label className="field-label">{t('vendors.category')}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-sm"
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
              <label className="field-label">{t('vendors.phone')}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                inputMode="numeric"
                maxLength={15}
                className="input-sm"
              />
            </div>
            <div>
              <label className="field-label">{t('vendors.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-sm" />
            </div>
          </div>

          <div>
            <label className="field-label">{t('vendors.tin')}</label>
            <input value={tinNumber} onChange={(e) => setTinNumber(e.target.value)} className="input-sm" />
          </div>

          <div>
            <label className="field-label">{t('vendors.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-sm resize-none" />
          </div>

          {error && <p role="alert" className="text-sm text-terracotta bg-terracotta-light/70 rounded-xl px-3.5 py-2.5">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              {t('vendors.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? '...' : t('vendors.save')}
            </button>
          </div>
        </form>
    </Modal>
  );
}