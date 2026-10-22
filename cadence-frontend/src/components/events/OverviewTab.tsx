import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Wallet, Building2, ListChecks, Stamp } from 'lucide-react';
import {
  fetchTimeline,
  fetchBudgetSummary,
  fetchEventVendors,
  fetchTasks,
  fetchApprovals,
  type ApprovalRequest,
} from '../../lib/events';
import { useCan } from '../../lib/permissions';

interface TimelineItem {
  id: number;
  start_time: string;
  end_time: string | null;
  title: string;
}

interface BudgetSummary {
  total_estimated: string;
  total_actual: string;
  total_vat: string;
}

interface BookedVendor {
  id: number;
  vendor_name: string;
  contract_amount_etb: string;
  payment_status: 'unpaid' | 'partial' | 'paid';
}

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-terracotta-light text-terracotta',
  high: 'bg-gold-light/60 text-[#8a4a12]',
  medium: 'bg-gold-light/45 text-[#7a5a14]',
  low: 'bg-sage-light text-teal-deep',
};

const approvalStatusColors: Record<string, string> = {
  pending: 'bg-gold-light/45 text-[#7a5a14]',
  approved: 'bg-sage-light text-teal-deep',
  changes_requested: 'bg-terracotta-light text-terracotta',
};

const vendorStatusColors: Record<string, string> = {
  unpaid: 'bg-terracotta-light text-terracotta',
  partial: 'bg-gold-light/45 text-[#7a5a14]',
  paid: 'bg-sage-light text-teal-deep',
};

type Tab = 'timeline' | 'budget' | 'vendors' | 'tasks' | 'approvals';

function CardHeader({ icon, title, onViewAll, t }: { icon: React.ReactNode; title: string; onViewAll: () => void; t: (k: string) => string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="flex items-center gap-2.5 font-display text-[15px] font-semibold text-teal-dark">
        <span className="icon-tile">{icon}</span>
        {title}
      </h3>
      <button onClick={onViewAll} className="text-[13px] font-semibold text-teal-deep hover:text-teal-dark underline-offset-4 hover:underline">
        {t('overview.viewAll')}
      </button>
    </div>
  );
}

export default function OverviewTab({ eventId, onNavigate }: { eventId: string; onNavigate: (tab: Tab) => void }) {
  const { t } = useTranslation();
  const can = useCan();
  // Only load (and show) the sections this role is allowed to see.
  const showBudget = can('budget:view');
  const showVendors = can('vendors:view');
  const showApprovals = can('approvals:view');
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [vendors, setVendors] = useState<BookedVendor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTimeline(eventId),
      showBudget ? fetchBudgetSummary(eventId) : Promise.resolve(null),
      showVendors ? fetchEventVendors(eventId) : Promise.resolve([]),
      fetchTasks(eventId),
      showApprovals ? fetchApprovals(eventId) : Promise.resolve([]),
    ])
      .then(([t, b, v, ta, ap]) => {
        setTimeline(t);
        setBudget(b);
        setVendors(v);
        setTasks(ta);
        setApprovals(ap);
      })
      .finally(() => setLoading(false));
  }, [eventId, showBudget, showVendors, showApprovals]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-36" />
        ))}
      </div>
    );
  }

  const fmt = (n: string) => `${Number(n).toLocaleString()} ETB`;
  const tasksDone = tasks.filter((task) => task.status === 'complete').length;
  const tasksProgress = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;
  const nextTasks = tasks.filter((task) => task.status !== 'complete').slice(0, 2);
  const totalContracted = vendors.reduce((sum, v) => sum + Number(v.contract_amount_etb || 0), 0);
  const vendorStatusCounts = vendors.reduce<Record<string, number>>((acc, v) => {
    acc[v.payment_status] = (acc[v.payment_status] ?? 0) + 1;
    return acc;
  }, {});
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  return (
    <div className="stagger-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="card p-5">
        <CardHeader icon={<Clock size={15} className="text-teal-deep" />} title={t('eventTabs.timeline')} onViewAll={() => onNavigate('timeline')} t={t} />
        {timeline.length === 0 ? (
          <p className="text-sm text-teal-dark/40">{t('timeline.empty')}</p>
        ) : (
          <div className="space-y-2">
            {timeline.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs font-semibold text-gold w-12 shrink-0">{item.start_time?.slice(0, 5)}</span>
                <span className="text-teal-dark truncate">{item.title}</span>
              </div>
            ))}
            {timeline.length > 3 && <p className="text-xs text-teal-dark/40">+{timeline.length - 3} {t('overview.more')}</p>}
          </div>
        )}
      </div>

      {showBudget && (
      <div className="card p-5">
        <CardHeader icon={<Wallet size={15} className="text-teal-deep" />} title={t('eventTabs.budget')} onViewAll={() => onNavigate('budget')} t={t} />
        {budget ? (
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-teal-dark/50">{t('budget.totalEstimated')}</span>
              <span className="font-semibold text-teal-dark">{fmt(budget.total_estimated)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-teal-dark/50">{t('budget.totalActual')}</span>
              <span className="font-semibold text-teal-dark">{fmt(budget.total_actual)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-teal-dark/50">{t('budget.totalVat')}</span>
              <span className="font-semibold text-gold">{fmt(budget.total_vat)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-teal-dark/40">{t('budget.empty')}</p>
        )}
      </div>
      )}

      {showVendors && (
      <div className="card p-5">
        <CardHeader icon={<Building2 size={15} className="text-teal-deep" />} title={t('eventTabs.vendors')} onViewAll={() => onNavigate('vendors')} t={t} />
        {vendors.length === 0 ? (
          <p className="text-sm text-teal-dark/40">{t('vendors.empty')}</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-teal-dark/50">{vendors.length} {t('vendorsPage.bookings')}</span>
              <span className="font-semibold text-teal-dark">{totalContracted.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(vendorStatusCounts).map(([status, count]) => (
                <span key={status} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${vendorStatusColors[status] || ''}`}>
                  {count} {t(`vendors.status.${status}`)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      <div className="card p-5">
        <CardHeader icon={<ListChecks size={15} className="text-teal-deep" />} title={t('eventTabs.tasks')} onViewAll={() => onNavigate('tasks')} t={t} />
        {tasks.length === 0 ? (
          <p className="text-sm text-teal-dark/40">{t('tasks.empty')}</p>
        ) : (
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-xs text-teal-dark/50 mb-1">
                <span>{tasksDone}/{tasks.length} {t('overview.tasksDone')}</span>
                <span>{tasksProgress}%</span>
              </div>
              <div className="h-1.5 bg-sage-light rounded-full overflow-hidden">
                <div className="h-full bg-sage rounded-full" style={{ width: `${tasksProgress}%` }} />
              </div>
            </div>
            {nextTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-teal-dark truncate">{task.title}</span>
                <span className={`chip shrink-0 ${priorityColors[task.priority] || ''}`}>
                  {t(`dashboard.priority.${task.priority}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showApprovals && (
      <div className="card p-5 sm:col-span-2 lg:col-span-1">
        <CardHeader icon={<Stamp size={15} className="text-teal-deep" />} title={t('eventTabs.approvals')} onViewAll={() => onNavigate('approvals')} t={t} />
        <p className="text-[11px] text-teal-dark/40 mb-2 -mt-1">{t('overview.approvalsHint')}</p>
        {approvals.length === 0 ? (
          <p className="text-sm text-teal-dark/40">{t('approvals.empty')}</p>
        ) : pendingApprovals.length === 0 ? (
          <p className="text-sm text-teal-dark/40">{t('overview.allClear')}</p>
        ) : (
          <div className="space-y-2">
            {pendingApprovals.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-teal-dark truncate">{a.title}</span>
                <span className={`chip shrink-0 ${approvalStatusColors[a.status]}`}>
                  {t(`approvals.status.${a.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}