import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import ClientLayout from '../components/layout/ClientLayout';
import Tilet from '../components/shared/Tilet';
import Countdown from '../components/shared/Countdown';
import DateDisplay from '../components/shared/DateDisplay';
import RatingStars from '../components/shared/RatingStars';
import {
  fetchMyEventDetail,
  respondToApproval,
  fetchMyEventRating,
  submitEventRating,
  type ClientEventDetail as EventDetailType,
  type ClientEventRating,
} from '../lib/client';

const statusColors: Record<string, string> = {
  pending: 'bg-gold-light/45 text-[#7a5a14]',
  approved: 'bg-sage-light text-teal-deep',
  changes_requested: 'bg-terracotta-light text-terracotta',
};

export default function ClientEventDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [rating, setRating] = useState<ClientEventRating | null>(null);
  const [ratingLoaded, setRatingLoaded] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const load = () => {
    if (!id) return;
    fetchMyEventDetail(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (!id || data?.event.status !== 'completed') return;
    fetchMyEventRating(id)
      .then(setRating)
      .finally(() => setRatingLoaded(true));
  }, [id, data?.event.status]);

  const handleSubmitRating = async () => {
    if (!id || ratingValue < 1) return;
    setSubmittingRating(true);
    try {
      const created = await submitEventRating(id, ratingValue, ratingComment.trim() || undefined);
      setRating(created);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleRespond = async (approvalId: number, status: 'approved' | 'changes_requested') => {
    if (!id) return;
    setSubmitting(approvalId);
    try {
      await respondToApproval(id, approvalId, status, commentDrafts[approvalId]);
      load();
    } finally {
      // Re-enable the buttons even if the request failed (the error banner shows why).
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="skeleton h-72 rounded-3xl" />
      </ClientLayout>
    );
  }

  if (!data) {
    return (
      <ClientLayout>
        <div className="card p-10 text-center">
          <p className="font-display text-xl font-semibold mb-2">{t('eventDetail.notFound')}</p>
          <p className="text-sm text-teal-dark/60">{t('portal.noAccess')}</p>
        </div>
      </ClientLayout>
    );
  }

  const { event, timeline, budgetSummary, approvals } = data;
  const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;

  return (
    <ClientLayout>
      <section className="relative overflow-hidden rounded-3xl bg-teal-deep text-white mb-6 shadow-[0_24px_60px_-28px_rgb(10_40_38/0.8)]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(70% 90% at 100% 0%, rgb(236 202 131 / 0.2), transparent 60%)' }}
        />
        <div className="relative px-6 sm:px-9 pt-8 pb-8 grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] items-end">
          <div className="min-w-0">
            <p className="text-gold-light/90 text-sm mb-2">{t(`eventsPage.type.${event.event_type}`)}</p>
            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02] font-semibold break-words mb-4">{displayName}</h1>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-2 text-sm text-white/80">
              <span className="flex items-start gap-1.5">
                <CalendarDays size={15} className="mt-0.5 shrink-0" />
                <span>
                  <DateDisplay iso={event.start_date} />
                  {event.end_date && event.end_date !== event.start_date && (
                    <span className="block text-white/60">
                      {t('eventDetail.until')} <DateDisplay iso={event.end_date} />
                    </span>
                  )}
                </span>
              </span>
              {event.venue_name && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {event.venue_name}
                </span>
              )}
              {event.guest_count != null && event.guest_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users size={15} />
                  {event.guest_count} {t('eventsPage.guests')}
                </span>
              )}
            </div>
          </div>
          <Countdown startDate={event.start_date} status={event.status} />
        </div>
        <Tilet size={12} tone="gold" weave />
      </section>

      <section className="card p-6 mb-6">
        <h2 className="section-title mb-4">{t('portal.timeline')}</h2>
        {timeline.length === 0 && <p className="text-sm text-teal-dark/40">{t('timeline.empty')}</p>}
        <ol>
          {timeline.map((item, i) => {
            const itemName = i18n.language === 'am' && item.title_am ? item.title_am : item.title;
            return (
              <li key={i} className="relative flex items-start gap-4 pb-6 last:pb-0">
                {i < timeline.length - 1 && <span className="absolute left-[71px] sm:left-[87px] top-5 bottom-0 w-px bg-teal-dark/12" />}
                <div className="w-14 sm:w-[72px] shrink-0 text-right pt-0.5">
                  <p className="font-display text-[15px] font-semibold text-teal-dark tabular-nums">{item.start_time?.slice(0, 5)}</p>
                  {item.end_time && <p className="text-xs text-teal-dark/45 tabular-nums">{item.end_time.slice(0, 5)}</p>}
                </div>
                <span className="relative z-10 mt-1.5 w-3.5 h-3.5 rounded-full bg-gold ring-4 ring-gold-light/40 shrink-0" />
                <div className="flex-1 pt-0.5">
                  <p className="text-[15px] text-teal-dark">{itemName}</p>
                  {item.description && <p className="text-[13px] text-teal-dark/55 mt-0.5">{item.description}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card p-6 mb-6">
        <h2 className="section-title mb-4">{t('portal.budget')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-teal-dark/55 mb-1">{t('portal.totalEstimated')}</p>
            <p className="font-display text-2xl font-semibold text-teal-dark">{Number(budgetSummary.total_estimated).toLocaleString()} ETB</p>
          </div>
          <div>
            <p className="text-sm text-teal-dark/55 mb-1">{t('portal.totalActual')}</p>
            <p className="font-display text-2xl font-semibold text-teal-dark">{Number(budgetSummary.total_actual).toLocaleString()} ETB</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title mb-4">{t('portal.approvals.title')}</h2>
        {approvals.length === 0 && <p className="text-sm text-teal-dark/40">{t('portal.approvals.empty')}</p>}
        <div className="space-y-3">
          {approvals.map((a) => (
            <div key={a.id} className={`rounded-2xl p-4 sm:p-5 border ${a.status === 'pending' ? 'border-gold/40 bg-gold-light/10' : 'border-teal-dark/[0.08]'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-display font-semibold text-teal-dark text-[16px]">{a.title}</p>
                <span className={`chip ${statusColors[a.status]}`}>
                  {t(`portal.approvals.status.${a.status}`)}
                </span>
              </div>
              {a.description && <p className="text-sm text-teal-dark/65 mb-3">{a.description}</p>}

              {a.status === 'pending' ? (
                <div className="space-y-2">
                  <textarea
                    placeholder={t('portal.approvals.comment')}
                    value={commentDrafts[a.id] || ''}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    rows={2}
                    className="input-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={submitting === a.id}
                      onClick={() => handleRespond(a.id, 'approved')}
                      className="btn-primary px-4 py-2"
                    >
                      {t('portal.approvals.approve')}
                    </button>
                    <button
                      disabled={submitting === a.id}
                      onClick={() => handleRespond(a.id, 'changes_requested')}
                      className="btn px-4 py-2 bg-white border border-terracotta/40 text-terracotta hover:bg-terracotta-light"
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

      {event.status === 'completed' && ratingLoaded && (
        <section className="card p-6 mt-6">
          <h2 className="section-title mb-4">{t('rating.title')}</h2>
          {rating ? (
            <div className="space-y-1.5">
              <RatingStars value={rating.rating} />
              {rating.comment && <p className="text-sm text-teal-dark/70 italic mt-1">"{rating.comment}"</p>}
              <p className="text-xs text-teal-dark/40">{t('rating.thanks')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-teal-dark/60">{t('rating.prompt')}</p>
              <RatingStars value={ratingValue} onChange={setRatingValue} size={24} />
              <textarea
                placeholder={t('rating.commentPlaceholder')}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={2}
                className="input-sm resize-none"
              />
              <button
                disabled={ratingValue < 1 || submittingRating}
                onClick={handleSubmitRating}
                className="btn-gold"
              >
                {submittingRating ? '...' : t('rating.submit')}
              </button>
            </div>
          )}
        </section>
      )}
    </ClientLayout>
  );
}