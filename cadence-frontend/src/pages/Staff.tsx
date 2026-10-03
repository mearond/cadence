import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, UserCircle2, Pencil, Trash2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import StaffFormModal from '../components/staff/StaffFormModal';
import { useAuthStore } from '../store/authStore';
import { fetchStaff, deleteStaff, type StaffMember } from '../lib/staff';

export default function Staff() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<'new' | StaffMember | null>(null);

  const load = () => fetchStaff().then(setStaff).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (member: StaffMember) => {
    if (!confirm(t('staffPage.confirmDelete'))) return;
    await deleteStaff(member.id);
    load();
  };

  if (currentUser?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl border border-sage/30 p-10 text-center">
          <Shield size={28} className="mx-auto text-teal-deep/30 mb-3" />
          <p className="text-sm text-teal-dark/50">{t('staffPage.adminOnly')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-dark">{t('staffPage.title')}</h1>
        <button
          onClick={() => setModalTarget('new')}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-gold/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('staffPage.addNew')}
        </button>
      </div>

      {loading && <p className="text-sm text-teal-dark/50">...</p>}

      {!loading && staff.length === 0 && (
        <div className="bg-white rounded-2xl border border-sage/30 p-10 text-center">
          <UserCircle2 size={28} className="mx-auto text-teal-deep/30 mb-3" />
          <p className="text-sm text-teal-dark/50">{t('staffPage.empty')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="bg-white rounded-2xl border border-sage/30 p-5 group"
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <h3 className="font-semibold text-teal-dark truncate">{member.name}</h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => setModalTarget(member)} className="text-teal-dark/40 hover:text-teal-deep p-1">
                  <Pencil size={13} />
                </button>
                {member.id !== currentUser?.id && (
                  <button onClick={() => handleDelete(member)} className="text-teal-dark/40 hover:text-terracotta p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 ${
                member.role === 'admin' ? 'bg-gold-light/40 text-[#8a6a1f]' : 'bg-sage-light text-teal-dark'
              }`}
            >
              {t(`staffPage.role${member.role === 'admin' ? 'Admin' : 'Staff'}`)}
            </span>
            {member.title && <p className="text-xs text-teal-dark/50 mb-2">{member.title}</p>}
            <p className="text-xs text-teal-dark/60">{member.email}</p>
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