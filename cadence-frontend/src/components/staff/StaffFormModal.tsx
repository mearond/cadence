import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check } from 'lucide-react';
import { createStaff, updateStaff, type StaffMember } from '../../lib/staff';
import { ASSIGNABLE_ROLES } from '../../lib/permissions';
import { isValidEmail } from '../../lib/validation';

type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

const ROLE_LABEL_KEYS: Record<AssignableRole, string> = {
  manager: 'staffPage.roleManager',
  coordinator: 'staffPage.roleCoordinator',
  staff: 'staffPage.roleStaff',
};

export default function StaffFormModal({
  staff,
  onClose,
  onSaved,
}: {
  staff: StaffMember | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!staff;
  const isOwner = staff?.role === 'owner';
  const [name, setName] = useState(staff?.name ?? '');
  const [email, setEmail] = useState(staff?.email ?? '');
  const [title, setTitle] = useState(staff?.title ?? '');
  const [role, setRole] = useState<AssignableRole>(
    staff && staff.role !== 'owner' ? staff.role : 'staff'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ email: string; temporaryPassword: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!isEdit && !isValidEmail(email)) {
      setError(t('staffPage.invalidEmail'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isEdit && staff) {
        await updateStaff(staff.id, {
          name: name.trim(),
          title: title.trim() || undefined,
          // The owner's role can't be changed, so don't send one.
          ...(isOwner ? {} : { role }),
        });
        onSaved();
        onClose();
      } else {
        const res = await createStaff({ name: name.trim(), email: email.trim(), title: title.trim() || undefined, role });
        setResult({ email: res.staff.email, temporaryPassword: res.temporaryPassword, emailSent: res.emailSent });
        onSaved();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('staffPage.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.email} / ${result.temporaryPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage/30">
          <h2 className="text-lg font-bold text-teal-dark">{isEdit ? t('staffPage.editTitle') : t('staffPage.addTitle')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sage-light text-teal-dark/50" aria-label={t('vendors.cancel')}>
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="px-6 py-5 space-y-3">
            <p className="text-sm text-teal-dark">{t('staffPage.created')}</p>
            <div className="bg-sage-light/40 rounded-lg p-3 text-sm space-y-1">
              <p>
                <span className="text-teal-dark/50">{t('inviteClient.email')}:</span> {result.email}
              </p>
              <p>
                <span className="text-teal-dark/50">{t('inviteClient.tempPassword')}:</span> {result.temporaryPassword}
              </p>
            </div>
            <p className="text-xs text-teal-dark/50">
              {result.emailSent ? t('inviteClient.emailSent') : t('inviteClient.emailFailed')}
            </p>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold text-teal-deep hover:text-teal-dark">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? t('inviteClient.copied') : t('inviteClient.copy')}
            </button>
            <button onClick={onClose} className="w-full bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full mt-2">
              {t('inviteClient.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
            <div>
              <label htmlFor="staff-name" className="block text-xs font-medium text-teal-dark/60 mb-1">{t('staffPage.name')}</label>
              <input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
            </div>
            {!isEdit && (
              <div>
                <label htmlFor="staff-email" className="block text-xs font-medium text-teal-dark/60 mb-1">{t('staffPage.email')}</label>
                <input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <div>
              <label htmlFor="staff-title" className="block text-xs font-medium text-teal-dark/60 mb-1">{t('staffPage.jobTitle')}</label>
              <input id="staff-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
            </div>
            {!isOwner && (
              <div>
                <label htmlFor="staff-role" className="block text-xs font-medium text-teal-dark/60 mb-1">{t('staffPage.role')}</label>
                <select
                  id="staff-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AssignableRole)}
                  className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{t(ROLE_LABEL_KEYS[r])}</option>
                  ))}
                </select>
                <p className="text-[11px] text-teal-dark/50 mt-1">{t(`staffPage.roleHint.${role}`)}</p>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
}
