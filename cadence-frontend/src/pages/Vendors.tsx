import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, Star, Tag, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import VendorFormModal from '../components/events/VendorFormModal';
import { fetchAllVendors, deleteVendor, type Vendor } from '../lib/events';

export default function Vendors() {
  const { t, i18n } = useTranslation();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-dark">{t('vendorsPage.title')}</h1>
        <button
          onClick={() => setModalTarget('new')}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-gold/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('vendorsPage.addNew')}
        </button>
      </div>

      {loading && <p className="text-sm text-teal-dark/50">...</p>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-sage/30 p-5">
              <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
                <Building2 size={13} />
                {t('vendorsPage.totalVendors')}
              </p>
              <p className="text-2xl font-bold text-teal-dark">{vendors.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-sage/30 p-5">
              <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
                <Tag size={13} />
                {t('vendorsPage.categoriesInUse')}
              </p>
              <p className="text-2xl font-bold text-teal-dark">{categoriesInUse}</p>
            </div>
            <div className="bg-white rounded-2xl border border-sage/30 p-5">
              <p className="text-xs font-semibold text-teal-dark/50 uppercase mb-2 flex items-center gap-1.5">
                <Star size={13} />
                {t('vendorsPage.totalBookings')}
              </p>
              <p className="text-2xl font-bold text-teal-dark">{totalBookings}</p>
            </div>
          </div>

          {mostPopular.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-teal-dark/40 uppercase tracking-wide mb-3">{t('vendorsPage.mostPopular')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mostPopular.map((v, i) => {
                  const categoryName = i18n.language === 'am' ? v.category_name_am : v.category_name_en;
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="bg-teal-deep rounded-2xl p-5 text-white"
                    >
                      <Star size={14} className="text-gold mb-2" fill="currentColor" />
                      <h3 className="font-semibold mb-1">{v.name}</h3>
                      {categoryName && <p className="text-xs text-white/60 mb-2">{categoryName}</p>}
                      <p className="text-xs text-white/70">
                        {v.booking_count} {t('vendorsPage.bookings')}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-teal-dark/40 uppercase tracking-wide mb-3">{t('vendorsPage.allVendors')}</p>

          {vendors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sage/30 p-10 text-center">
              <Building2 size={28} className="mx-auto text-teal-deep/30 mb-3" />
              <p className="text-sm text-teal-dark/50">{t('vendorsPage.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v, i) => {
                const categoryName = i18n.language === 'am' ? v.category_name_am : v.category_name_en;
                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-sage/30 p-5 group relative"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-teal-dark truncate">{v.name}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {(v.booking_count ?? 0) > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sage-light text-teal-dark">
                            {v.booking_count} {t('vendorsPage.bookings')}
                          </span>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModalTarget(v)} className="text-teal-dark/40 hover:text-teal-deep p-1">
                            <Pencil size={13} />
                          </button>
                          <button onClick={(e) => handleDelete(e, v)} className="text-teal-dark/40 hover:text-terracotta p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {categoryName && <p className="text-xs text-teal-dark/50 mb-3">{categoryName}</p>}
                    <div className="space-y-1 text-xs text-teal-dark/60">
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