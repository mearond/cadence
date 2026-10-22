import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

import { Plus, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { fetchTasks, addTask, updateTask, deleteTask } from '../../lib/events';
import { useCan } from '../../lib/permissions';

const PRIORITY_CHIP: Record<string, string> = {
  critical: 'bg-terracotta-light text-terracotta',
  high: 'bg-gold-light/60 text-[#8a4a12]',
  medium: 'bg-gold-light/45 text-[#7a5a14]',
  low: 'bg-sage-light text-teal-deep',
};

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
  checkpoint_count: number;
  checkpoint_done: number;
}

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function TasksTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const can = useCan();
  const canManage = can('tasks:manage');
  const canDelete = can('tasks:delete');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formMode, setFormMode] = useState<'none' | 'add' | number>('none');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const load = () => fetchTasks(eventId).then(setTasks);

  useEffect(() => {
    load();
  }, [eventId]);

  const resetForm = () => {
    setTitle('');
    setPriority('medium');
    setFormMode('none');
  };

  const startAdd = () => {
    setTitle('');
    setPriority('medium');
    setFormMode('add');
  };

  const startEdit = (task: Task) => {
    setTitle(task.title);
    setPriority(task.priority);
    setFormMode(task.id);
  };

  const handleSave = async () => {
    if (!title) return;
    if (formMode === 'add') {
      await addTask(eventId, { title, priority });
    } else if (typeof formMode === 'number') {
      await updateTask(eventId, formMode, { title, priority });
    }
    resetForm();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(eventId, id);
    load();
  };

  const toggleStatus = async (task: Task) => {
    await updateTask(eventId, task.id, { status: task.status === 'complete' ? 'pending' : 'complete' });
    load();
  };

  return (
    <div className="card p-6">
      {tasks.length > 0 && (() => {
        const done = tasks.filter((x) => x.status === 'complete').length;
        const pct = Math.round((done / tasks.length) * 100);
        return (
          <div className="mb-5">
            <div className="flex items-baseline justify-between mb-2">
              <p className="section-title">{t('tasks.progress', { done, total: tasks.length })}</p>
              <p className="font-display font-semibold text-teal-deep">{pct}%</p>
            </div>
            <div className="h-2 rounded-full bg-teal-dark/[0.07] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-deep to-sage"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        );
      })()}
      {tasks.length === 0 && formMode === 'none' && <p className="text-sm text-teal-dark/50 mb-4">{t('tasks.empty')}</p>}

      <div className="stagger-grid space-y-1 mb-4">
        {tasks.map((task) =>
          formMode === task.id ? (
            <TaskForm key={task.id} t={t} title={title} setTitle={setTitle} priority={priority} setPriority={setPriority} onSave={handleSave} onCancel={resetForm} />
          ) : (
            <div key={task.id} className="flex items-center gap-3 py-3 border-b border-teal-dark/[0.06] last:border-0 text-[15px] group">
              <button
                onClick={() => toggleStatus(task)}
                className="shrink-0 grid place-items-center w-7 h-7 -m-1 rounded-full hover:bg-sage-light"
                aria-label={task.status === 'complete' ? t('tasks.markPending') : t('tasks.markDone')}
                aria-pressed={task.status === 'complete'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {task.status === 'complete' ? (
                    <motion.span key="done" initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.4 }} transition={{ type: 'spring', stiffness: 600, damping: 18 }}>
                      <CheckCircle2 size={20} className="text-teal-deep" fill="#e2ebde" />
                    </motion.span>
                  ) : (
                    <motion.span key="todo" initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }}>
                      <Circle size={20} className="text-teal-dark/25" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <p className={`flex-1 transition-colors ${task.status === 'complete' ? 'text-teal-dark/40 line-through decoration-teal-dark/30' : 'text-teal-dark'}`}>{task.title}</p>
              {task.priority && task.status !== 'complete' && (
                <span className={`chip hidden sm:inline-flex ${PRIORITY_CHIP[task.priority] ?? ''}`}>{t(`dashboard.priority.${task.priority}`)}</span>
              )}
              {task.checkpoint_count > 0 && (
                <span className="text-[13px] text-teal-dark/45 tabular-nums">
                  {task.checkpoint_done}/{task.checkpoint_count} {t('tasks.checkpoints')}
                </span>
              )}
              {(canManage || canDelete) && (
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {canManage && (
                    <button onClick={() => startEdit(task)} className="icon-btn w-7 h-7">
                      <Pencil size={13} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(task.id)} className="icon-btn-danger w-7 h-7">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {formMode === 'add' ? (
        <TaskForm t={t} title={title} setTitle={setTitle} priority={priority} setPriority={setPriority} onSave={handleSave} onCancel={resetForm} />
      ) : formMode === 'none' && canManage ? (
        <button onClick={startAdd} className="btn-ghost text-teal-deep -ml-3">
          <Plus size={15} />
          {t('tasks.add')}
        </button>
      ) : null}
    </div>
  );
}

function TaskForm({
  t,
  title,
  setTitle,
  priority,
  setPriority,
  onSave,
  onCancel,
}: {
  t: (key: string) => string;
  title: string;
  setTitle: (v: string) => void;
  priority: string;
  setPriority: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 pt-3 pb-2 border-t border-teal-dark/[0.07]">
      <input placeholder={t('tasks.title')} value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10" />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-white border border-teal-dark/15 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-deep/10">
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>
      <button onClick={onSave} className="btn-gold">
        {t('tasks.save')}
      </button>
      <button onClick={onCancel} className="text-sm text-teal-dark/50 px-2 py-2">
        {t('vendors.cancel')}
      </button>
    </div>
  );
}