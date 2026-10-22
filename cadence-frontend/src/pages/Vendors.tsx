import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, Star, Tag, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/shared/PageHeader';
import CountUp from '../components/shared/CountUp';
import Tilet from '../components/shared/Tilet';
import DashboardLayout from '../components/layout/DashboardLayout';
import VendorFormModal from '../components/events/VendorFormModal';
import { fetchAllVendors, deleteVendor, type Vendor } from '../lib/events';
import { useCan } from '../lib/permissions';

export default function Vendors() {
  const { t, i18n } = useTranslation();
  const canManage = useCan()('vendors:manage');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<'new' | Vendor | null>(null);

  const load = () => fetchAllVendors().then(setVendors).finally(() => setLoading(false));

  const handleDelete = async (e: React.MouseEvent, vendor: Vendor) => {
    e.stopPropagation();
    if (!confirm(t('vendors.confirmDelete'))) return;
    await deleteVendor(vendor.id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const mostPopular = useMemo(
    () =>
      [...vendors]
        .filter((v) => (v.booking_count ?? 0) > 0)
        .sort((a, b) => (b.booking_count ?? 0) - (a.booking_count ?? 0))
        .slice(0, 3),
    [vendors]
  );

  const categoriesInUse = useMemo(
    () => new Set(vendors.filter((v) => v.category_id).map((v) => v.category_id)).size,
    [vendors]
  );

  const totalBookings = useMemo(() => vendors.reduce((sum, v) => sum + (v.booking_count ?? 0), 0), [vendors]);

  return (
    <DashboardLayout>
      <PageHeader
        title={t('vendorsPage.title')}
        subtitle={!loading && t('vendorsPage.subtitle', { count: vendors.length })}
        action={
          canManage && (
            <button onClick={() => setModalTarget('new')} className="btn-gold">
              <Plus size={16} />
              {t('vendorsPage.addNew')}
            </button>
          )
        }
      />

      {loading && <div className="skeleton h-24 mb-8" />}

      {!loading && (
        <>
          <dl className="card-sage grid grid-cols-3 divide-x divide-teal-dark/[0.08] mb-8">
            {[
              { icon: Building2, label: t('vendorsPage.totalVendors'), value: vendors.length },
              { icon: Tag, label: t('vendorsPage.categoriesInUse'), value: categoriesInUse },
              { icon: Star, label: t('vendorsPage.totalBookings'), value: totalBookings },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="px-4 sm:px-6 py-5">
                <dt className="flex items-center gap-1.5 text-[13px] text-teal-dark/55">
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </dt>
                <dd className="font-display text-3xl font-semibold text-teal-dark mt-1">
                  <CountUp value={value} />
                </dd>
              </div>
            ))}
          </dl>

          {mostPopular.length > 0 && (
            <div className="mb-10">
              <h2 className="section-title text-lg mb-4">{t('vendorsPage.mostPopular')}</h2>
              <div className="stagger-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mostPopular.map((v, i) => {
                  const categoryName = i18n.language === 'am' ? v.category_name_am : v.category_name_en;
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="relative overflow-hidden rounded-2xl bg-teal-deep text-white p-5 pt-6 shadow-[0_18px_40px_-22px_rgb(10_40_38/0.9)]"
                    >
                      <div className="absolute inset-x-0 top-0"><Tilet size={6} tone="gold" /></div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold leading-snug mb-1">{v.name}</h3>
                        <span className="font-display text-sm font-semibold text-gold-light shrink-0">{i + 1}</span>
                      </div>
                      {categoryName && <p className="text-xs text-white/60 mb-2">{categoryName}</p>}
                      <p className="text-sm text-gold-light/90">
                        {v.booking_count} {t('vendorsPage.bookings')}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <h2 className="section-title text-lg mb-4">{t('vendorsPage.allVendors')}</h2>

          {vendors.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="grid place-items-center w-14 h-14 rounded-2xl bg-sage-light text-teal-deep mx-auto mb-4"><Building2 size={26} /></div>
              <p className="text-sm text-teal-dark/50">{t('vendorsPage.empty')}</p>
            </div>
          ) : (
            <div className="stagger-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v, i) => {
                const categoryName = i18n.language === 'am' ? v.category_name_am : v.category_name_en;
                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="card-interactive cursor-default p-5 group relative"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-display text-[17px] font-semibold text-teal-dark truncate">{v.name}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {(v.booking_count ?? 0) > 0 && (
                          <span className="chip bg-sage-light text-teal-deep">
                            {v.booking_count} {t('vendorsPage.bookings')}
                          </span>
                        )}
                        {canManage && (
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button onClick={() => setModalTarget(v)} className="icon-btn w-7 h-7">
                            <Pencil size={13} />
                          </button>
                          <button onClick={(e) => handleDelete(e, v)} className="icon-btn-danger w-7 h-7">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        )}
                      </div>
                    </div>
                    {categoryName && <p className="text-[13px] text-teal-dark/55 mb-4">{categoryName}</p>}
                    <div className="space-y-1.5 text-[13px] text-teal-dark/65">
                      {v.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={11} />
                          {v.phone}
                        </p>
                      )}
                      {v.email && (
                        <p className="flex items-center gap-1.5">
                          <Mail size={11} />
                          {v.email}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {modalTarget && (
        <VendorFormModal
          vendor={modalTarget === 'new' ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onCreated={load}
        />
      )}
    </DashboardLayout>
  );
}