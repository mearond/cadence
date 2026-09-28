import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import ClientLayout from '../components/layout/ClientLayout';
import DateDisplay from '../components/shared/DateDisplay';
import { fetchMyEventDetail, respondToApproval, type ClientEventDetail as EventDetailType } from '../lib/client';

const statusColors: Record<string, string> = {
  pending: 'bg-gold-light/40 text-[#8a6a1f]',
  approved: 'bg-sage-light text-teal-dark',
  changes_requested: 'bg-red-100 text-red-600',
};

export default function ClientEventDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const load = () => {
    if (!id) return;
    fetchMyEventDetail(id).then(setData).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleRespond = async (approvalId: number, status: 'approved' | 'changes_requested') => {
    if (!id) return;
    setSubmitting(approvalId);
    await respondToApproval(id, approvalId, status, commentDrafts[approvalId]);
    setSubmitting(null);
    load();
  };

  if (loading || !data) {
    return (
      <ClientLayout>
        <p className="text-sm text-teal-dark/50">...</p>
      </ClientLayout>
    );
  }

  const { event, timeline, budgetSummary, approvals } = data;
  const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;

  return (
    <ClientLayout>
      <div className="bg-teal-deep rounded-2xl p-6 text-white mb-6">
        <h1 className="text-xl font-bold mb-2">{displayName}</h1>
        <div className="flex flex-wrap items-start gap-4 text-sm text-white/80">
          <span className="flex items-start gap-1.5">
            <CalendarDays size={14} className="mt-0.5 shrink-0" />
            <span>
              <DateDisplay iso={event.start_date} />
              {event.end_date && (
                <>
                  {' – '}
                  <DateDisplay iso={event.end_date} />
                </>
              )}
            </span>
          </span>
          {event.venue_name && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {event.venue_name}
            </span>
          )}
          {event.guest_count && (
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {event.guest_count} {t('eventsPage.guests')}
            </span>
          )}
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-sage/30 p-6 mb-6">
        <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide mb-4">{t('portal.timeline')}</h2>
        {timeline.length === 0 && <p className="text-sm text-teal-dark/40">{t('timeline.empty')}</p>}
        <div className="space-y-3">
          {timeline.map((item, i) => {
            const itemName = i18n.language === 'am' && item.title_am ? item.title_am : item.title;
            return (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-28 shrink-0 font-semibold text-gold">
                  {item.start_time?.slice(0, 5)}
                  {item.end_time && <span className="text-teal-dark/40 font-normal"> – {item.end_time.slice(0, 5)}</span>}
                </div>
                <p className="text-teal-dark">{itemName}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-sage/30 p-6 mb-6">
        <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide mb-4">{t('portal.budget')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-teal-dark/50 mb-1">{t('portal.totalEstimated')}</p>
            <p className="text-lg font-bold text-teal-dark">{Number(budgetSummary.total_estimated).toLocaleString()} ETB</p>
          </div>
          <div>
            <p className="text-xs text-teal-dark/50 mb-1">{t('portal.totalActual')}</p>
            <p className="text-lg font-bold text-teal-dark">{Number(budgetSummary.total_actual).toLocaleString()} ETB</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-sage/30 p-6">
        <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide mb-4">{t('portal.approvals.title')}</h2>
        {approvals.length === 0 && <p className="text-sm text-teal-dark/40">{t('portal.approvals.empty')}</p>}
        <div className="space-y-4">
          {approvals.map((a) => (
            <div key={a.id} className="border border-sage/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-teal-dark text-sm">{a.title}</p>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[a.status]}`}>
                  {t(`portal.approvals.status.${a.status}`)}
                </span>
              </div>
              {a.description && <p className="text-xs text-teal-dark/60 mb-3">{a.description}</p>}

              {a.status === 'pending' ? (
                <div className="space-y-2">
                  <textarea
                    placeholder={t('portal.approvals.comment')}
                    value={commentDrafts[a.id] || ''}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    rows={2}
                    className="w-full border border-sage/40 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={submitting === a.id}
                      onClick={() => handleRespond(a.id, 'approved')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sage text-white hover:bg-sage/90 disabled:opacity-50"
                    >
                      {t('portal.approvals.approve')}
                    </button>
                    <button
                      disabled={submitting === a.id}
                      onClick={() => handleRespond(a.id, 'changes_requested')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
                    >
                      {t('portal.approvals.requestChanges')}
                    </button>
                  </div>
                </div>
              ) : (
                a.client_comment && <p className="text-xs text-teal-dark/50 italic">"{a.client_comment}"</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </ClientLayout>
  );
}