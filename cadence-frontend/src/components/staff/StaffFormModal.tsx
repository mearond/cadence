import { useState } from 'react';
import Modal from '../shared/Modal';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';
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
    <Modal title={isEdit ? t('staffPage.editTitle') : t('staffPage.addTitle')} onClose={onClose} width="sm">

        {result ? (
          <div className="px-6 pt-2 pb-6 space-y-3">
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
            <button onClick={onClose} className="w-full btn-primary mt-2">
              {t('inviteClient.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pt-2 pb-6 space-y-4">
            <div>
              <label htmlFor="staff-name" className="field-label">{t('staffPage.name')}</label>
              <input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} required className="input-sm" />
            </div>
            {!isEdit && (
              <div>
                <label htmlFor="staff-email" className="field-label">{t('staffPage.email')}</label>
                <input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-sm" />
              </div>
            )}
            <div>
              <label htmlFor="staff-title" className="field-label">{t('staffPage.jobTitle')}</label>
              <input id="staff-title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-sm" />
            </div>
            {!isOwner && (
              <div>
                <label htmlFor="staff-role" className="field-label">{t('staffPage.role')}</label>
                <select
                  id="staff-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AssignableRole)}
                  className="input-sm"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{t(ROLE_LABEL_KEYS[r])}</option>
                  ))}
                </select>
                <p className="text-[11px] text-teal-dark/50 mt-1">{t(`staffPage.roleHint.${role}`)}</p>
              </div>
            )}

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
        )}
    </Modal>
  );
}
