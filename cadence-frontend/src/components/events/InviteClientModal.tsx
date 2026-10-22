import { useState } from 'react';
import Modal from '../shared/Modal';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';
import { inviteClient } from '../../lib/events';
import { isValidEmail } from '../../lib/validation';

export default function InviteClientModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ email: string; temporaryPassword: string | null; message: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (!isValidEmail(email)) {
      setError(t('inviteClient.invalidEmail'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await inviteClient(eventId, { name: name.trim(), email: email.trim() });
      setResult({ email: res.client.email, temporaryPassword: res.temporaryPassword, message: res.message, emailSent: res.emailSent });
    } catch (err: any) {
      setError(err.response?.data?.error || t('inviteClient.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!result?.temporaryPassword) return;
    navigator.clipboard.writeText(`${result.email} / ${result.temporaryPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal title={t('inviteClient.title')} onClose={onClose} width="sm">

        {result ? (
          <div className="px-6 pt-2 pb-6 space-y-3">
            <p className="text-sm text-teal-dark">{result.message}</p>
            <div className="bg-sage-light/40 rounded-lg p-3 text-sm space-y-1">
              <p>
                <span className="text-teal-dark/50">{t('inviteClient.email')}:</span> {result.email}
              </p>
              {result.temporaryPassword ? (
                <p>
                  <span className="text-teal-dark/50">{t('inviteClient.tempPassword')}:</span> {result.temporaryPassword}
                </p>
              ) : (
                <p className="text-xs text-teal-dark/50 italic">{t('inviteClient.existingClient')}</p>
              )}
            </div>
            {result.temporaryPassword && (
              <>
                <p className="text-xs text-teal-dark/50">
                  {result.emailSent ? t('inviteClient.emailSent') : t('inviteClient.emailFailed')}
                </p>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold text-teal-deep hover:text-teal-dark">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t('inviteClient.copied') : t('inviteClient.copy')}
                </button>
              </>
            )}
            <button onClick={onClose} className="w-full btn-primary mt-2">
              {t('inviteClient.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pt-2 pb-6 space-y-4">
            <div>
              <label className="field-label">{t('inviteClient.name')}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="input-sm" />
            </div>
            <div>
              <label className="field-label">{t('inviteClient.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-sm" />
            </div>
            {error && <p role="alert" className="text-sm text-terracotta bg-terracotta-light/70 rounded-xl px-3.5 py-2.5">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost">
                {t('vendors.cancel')}
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? '...' : t('inviteClient.send')}
              </button>
            </div>
          </form>
        )}
    </Modal>
  );
}