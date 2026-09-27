import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { fetchTasks, addTask } from '../../lib/events';

export default function TasksTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const load = () => fetchTasks(eventId).then(setTasks);

  useEffect(() => { load(); }, [eventId]);

  const handleAdd = async () => {
    if (!title) return;
    await addTask(eventId, { title, priority });
    setTitle(''); setPriority('medium'); setAdding(false);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      {tasks.length === 0 && !adding && <p className="text-sm text-teal-dark/50 mb-4">{t('tasks.empty')}</p>}

      <div className="space-y-2 mb-4">
        {tasks.map((task) => {
          const done = task.checkpoint_count > 0 && task.checkpoint_done === task.checkpoint_count;
          return (
            <div key={task.id} className="flex items-center gap-3 py-2 border-b border-sage/20 last:border-0 text-sm">
              {done ? <CheckCircle2 size={16} className="text-sage shrink-0" /> : <Circle size={16} className="text-teal-deep/30 shrink-0" />}
              <p className="flex-1 text-teal-dark">{task.title}</p>
              {task.checkpoint_count > 0 && (
                <span className="text-xs text-teal-dark/40">
                  {task.checkpoint_done}/{task.checkpoint_count} {t('tasks.checkpoints')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="flex gap-2 pt-3 border-t border-sage/20">
          <input placeholder={t('tasks.title')} value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button onClick={handleAdd} className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">{t('tasks.save')}</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
          <Plus size={15} />{t('tasks.add')}
        </button>
      )}
    </div>
  );
}