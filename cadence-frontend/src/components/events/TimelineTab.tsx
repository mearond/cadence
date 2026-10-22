import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchTimeline, addTimelineItem, updateTimelineItem, deleteTimelineItem } from '../../lib/events';
import { useCan } from '../../lib/permissions';

interface TimelineItem {
  id: number;
  start_time: string;
  end_time: string | null;
  title: string;
}

export default function TimelineTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const canManage = useCan()('timeline:manage');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [formMode, setFormMode] = useState<'none' | 'add' | number>('none');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const load = () => fetchTimeline(eventId).then(setItems);

  useEffect(() => {
    load();
  }, [eventId]);

  const resetForm = () => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setFormMode('none');
  };

  const startAdd = () => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setFormMode('add');
  };

  const startEdit = (item: TimelineItem) => {
    setTitle(item.title);
    setStartTime(item.start_time?.slice(0, 5) || '');
    setEndTime(item.end_time?.slice(0, 5) || '');
    setFormMode(item.id);
  };

  const handleSave = async () => {
    if (!title || !startTime) return;
    if (formMode === 'add') {
      await addTimelineItem(eventId, { title, startTime, endTime: endTime || undefined });
    } else if (typeof formMode === 'number') {
      await updateTimelineItem(eventId, formMode, { title, startTime, endTime: endTime || undefined });
    }
    resetForm();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this timeline item?')) return;
    await deleteTimelineItem(eventId, id);
    load();
  };

  return (
    <div className="card p-6">
      {items.length === 0 && formMode === 'none' && <p className="text-sm text-teal-dark/50 mb-4">{t('timeline.empty')}</p>}

      <ol className="relative mb-5">
        {items.map((item, i) =>
          formMode === item.id ? (
            <TimelineForm
              key={item.id}
              t={t}
              title={title}
              setTitle={setTitle}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              onSave={handleSave}
              onCancel={resetForm}
            />
          ) : (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.04 }}
              className="relative flex items-start gap-4 pb-6 last:pb-0 group"
            >
              {i < items.length - 1 && <span className="absolute left-[71px] sm:left-[87px] top-5 bottom-0 w-px bg-teal-dark/12" />}
              <div className="w-14 sm:w-[72px] shrink-0 text-right pt-0.5">
                <p className="font-display text-[15px] font-semibold text-teal-dark tabular-nums">{item.start_time?.slice(0, 5)}</p>
                {item.end_time && <p className="text-xs text-teal-dark/45 tabular-nums">{item.end_time.slice(0, 5)}</p>}
              </div>
              <span className="relative z-10 mt-1.5 w-3.5 h-3.5 rounded-full bg-gold ring-4 ring-gold-light/40 shrink-0" />
              <p className="flex-1 text-[15px] text-teal-dark pt-0.5">{item.title}</p>
              {canManage && (
              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button onClick={() => startEdit(item)} className="icon-btn w-7 h-7">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="icon-btn-danger w-7 h-7">
                  <Trash2 size={13} />
                </button>
              </div>
              )}
            </motion.li>
          )
        )}
      </ol>

      {formMode === 'add' ? (
        <TimelineForm
          t={t}
          title={title}
          setTitle={setTitle}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          onSave={handleSave}
          onCancel={resetForm}
        />
      ) : formMode === 'none' && canManage ? (
        <button onClick={startAdd} className="btn-ghost text-teal-deep -ml-3">
          <Plus size={15} />
          {t('timeline.add')}
        </button>
      ) : null}
    </div>
  );
}

function TimelineForm({
  t,
  title,
  setTitle,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onSave,
  onCancel,
}: {
  t: (key: string) => string;
  title: string;
  setTitle: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 items-end pt-3 pb-2 border-t border-teal-dark/[0.07]">
      <div className="flex-1">
        <label className="field-label">{t('timeline.title')}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-sm" />
      </div>
      <div>
        <label className="field-label">{t('timeline.startTime')}</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      </div>
      <div>
        <label className="field-label">{t('timeline.endTime')}</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      </div>
      <button onClick={onSave} className="btn-gold">
        {t('timeline.save')}
      </button>
      <button onClick={onCancel} className="text-sm text-teal-dark/50 px-2 py-2">
        {t('vendors.cancel')}
      </button>
    </div>
  );
}