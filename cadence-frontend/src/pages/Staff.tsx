import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, UserCircle2, Pencil, Trash2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/shared/PageHeader';
import DashboardLayout from '../components/layout/DashboardLayout';
import StaffFormModal from '../components/staff/StaffFormModal';
import { useAuthStore } from '../store/authStore';
import { fetchStaff, deleteStaff, type StaffMember } from '../lib/staff';
import { useCan, type StaffRole } from '../lib/permissions';

const roleStyles: Record<StaffRole, { label: string; className: string }> = {
  owner: { label: 'staffPage.roleOwner', className: 'bg-gold-light/60 text-[#6b4c0e]' },
  manager: { label: 'staffPage.roleManager', className: 'bg-teal-deep text-white' },
  coordinator: { label: 'staffPage.roleCoordinator', className: 'bg-sage-light text-teal-deep' },
  staff: { label: 'staffPage.roleStaff', className: 'bg-teal-dark/[0.07] text-teal-dark/70' },
};

export default function Staff() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const can = useCan();
  const canManage = can('staff:manage');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<'new' | StaffMember | null>(null);

  const load = () => fetchStaff().then(setStaff).finally(() => setLoading(false));

  useEffect(() => {
    if (can('staff:view')) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (member: StaffMember) => {
    if (!confirm(t('staffPage.confirmDelete'))) return;
    await deleteStaff(member.id);
    load();
  };

  if (!can('staff:view')) {
    return (
      <DashboardLayout>
        <div className="card p-10 text-center">
          <Shield size={28} className="mx-auto text-teal-deep/30 mb-3" />
          <p className="text-sm text-teal-dark/50">{t('staffPage.noAccess')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={t('staffPage.title')}
        subtitle={!loading && t('staffPage.subtitle', { count: staff.length })}
        action={
          canManage && (
            <button onClick={() => setModalTarget('new')} className="btn-gold">
              <Plus size={16} />
              {t('staffPage.addNew')}
            </button>
          )
        }
      />

      {loading && <div className="skeleton h-32" />}

      {!loading && staff.length === 0 && (
        <div className="card p-12 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-sage-light text-teal-deep mx-auto mb-4"><UserCircle2 size={26} /></div>
          <p className="text-sm text-teal-dark/50">{t('staffPage.empty')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {staff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="card p-5 group flex gap-4"
          >
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-deep to-teal-dark text-gold-light font-display text-lg font-semibold shrink-0">
              {member.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between mb-1.5 gap-2">
              <h3 className="font-display text-[17px] font-semibold text-teal-dark truncate">{member.name}</h3>
              {canManage && (
              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 -mt-1 -mr-1">
                <button onClick={() => setModalTarget(member)} className="icon-btn w-7 h-7">
                  <Pencil size={13} />
                </button>
                {member.id !== currentUser?.id && member.role !== 'owner' && (
                  <button onClick={() => handleDelete(member)} className="icon-btn-danger w-7 h-7">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              )}
            </div>
            <span
              className={`chip mb-2 ${roleStyles[member.role]?.className ?? ''}`}
            >
              {t(roleStyles[member.role]?.label ?? 'staffPage.roleStaff')}
            </span>
            {member.title && <p className="text-[13px] text-teal-dark/55 mb-1">{member.title}</p>}
            <p className="text-[13px] text-teal-dark/60 truncate">{member.email}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {modalTarget && (
        <StaffFormModal
          staff={modalTarget === 'new' ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSaved={load}
        />
      )}
    </DashboardLayout>
  );
}