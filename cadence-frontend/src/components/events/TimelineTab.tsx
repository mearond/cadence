import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Clock } from 'lucide-react';
import { fetchTimeline, addTimelineItem } from '../../lib/events';

export default function TimelineTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const load = () => fetchTimeline(eventId).then(setItems);

  useEffect(() => { load(); }, [eventId]);

  const handleAdd = async () => {
    if (!title || !startTime) return;
    await addTimelineItem(eventId, { title, startTime, endTime: endTime || undefined });
    setTitle(''); setStartTime(''); setEndTime(''); setAdding(false);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      {items.length === 0 && !adding && (
        <p className="text-sm text-teal-dark/50 mb-4">{t('timeline.empty')}</p>
      )}

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-sage/20 last:border-0">
          <div className="w-28 shrink-0 text-xs font-semibold text-gold">
                {item.start_time?.slice(0, 5)}
                {item.end_time && <span className="text-teal-dark/40 font-normal"> – {item.end_time.slice(0, 5)}</span>}
            </div>
            <Clock size={14} className="text-teal-deep/40 shrink-0" />
            <p className="text-sm text-teal-dark">{item.title}</p>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2 items-end pt-3 border-t border-sage/20">
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
          <button onClick={handleAdd} className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">{t('timeline.save')}</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
          <Plus size={15} />{t('timeline.add')}
        </button>
      )}
    </div>
  );
}