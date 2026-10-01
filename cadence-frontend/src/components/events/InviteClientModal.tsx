import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check } from 'lucide-react';
import { inviteClient } from '../../lib/events';

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage/30">
          <h2 className="text-lg font-bold text-teal-dark">{t('inviteClient.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sage-light text-teal-dark/50">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="px-6 py-5 space-y-3">
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
            <button onClick={onClose} className="w-full bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full mt-2">
              {t('inviteClient.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('inviteClient.name')}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-teal-dark/60 mb-1">{t('inviteClient.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm" />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium text-teal-dark/60 hover:bg-sage-light">
                {t('vendors.cancel')}
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-full text-sm font-semibold bg-gold text-white hover:bg-gold/90 disabled:opacity-50">
                {saving ? '...' : t('inviteClient.send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}