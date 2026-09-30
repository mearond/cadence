import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, Pencil, Trash2 } from 'lucide-react';
import { fetchTimeline, addTimelineItem, updateTimelineItem, deleteTimelineItem } from '../../lib/events';

interface TimelineItem {
  id: number;
  start_time: string;
  end_time: string | null;
  title: string;
}

export default function TimelineTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
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
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      {items.length === 0 && formMode === 'none' && <p className="text-sm text-teal-dark/50 mb-4">{t('timeline.empty')}</p>}

      <div className="space-y-1 mb-4">
        {items.map((item) =>
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
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-sage/20 last:border-0 group">
              <div className="w-28 shrink-0 text-xs font-semibold text-gold">
                {item.start_time?.slice(0, 5)}
                {item.end_time && <span className="text-teal-dark/40 font-normal"> – {item.end_time.slice(0, 5)}</span>}
              </div>
              <Clock size={14} className="text-teal-deep/40 shrink-0" />
              <p className="flex-1 text-sm text-teal-dark">{item.title}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(item)} className="text-teal-dark/40 hover:text-teal-deep p-1">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-teal-dark/40 hover:text-terracotta p-1">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

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
      ) : formMode === 'none' ? (
        <button onClick={startAdd} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
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
    <div className="flex gap-2 items-end pt-3 pb-2 border-t border-sage/20">
      <div className="flex-1">
        <label className="block text-xs text-teal-dark/50 mb-1">{t('timeline.title')}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-teal-dark/50 mb-1">{t('timeline.startTime')}</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-teal-dark/50 mb-1">{t('timeline.endTime')}</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      </div>
      <button onClick={onSave} className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">
        {t('timeline.save')}
      </button>
      <button onClick={onCancel} className="text-sm text-teal-dark/50 px-2 py-2">
        {t('vendors.cancel')}
      </button>
    </div>
  );
}