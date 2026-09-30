import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { fetchTasks, addTask, updateTask, deleteTask } from '../../lib/events';

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
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      {tasks.length === 0 && formMode === 'none' && <p className="text-sm text-teal-dark/50 mb-4">{t('tasks.empty')}</p>}

      <div className="space-y-1 mb-4">
        {tasks.map((task) =>
          formMode === task.id ? (
            <TaskForm key={task.id} t={t} title={title} setTitle={setTitle} priority={priority} setPriority={setPriority} onSave={handleSave} onCancel={resetForm} />
          ) : (
            <div key={task.id} className="flex items-center gap-3 py-2 border-b border-sage/20 last:border-0 text-sm group">
              <button onClick={() => toggleStatus(task)} className="shrink-0">
                {task.status === 'complete' ? <CheckCircle2 size={16} className="text-sage" /> : <Circle size={16} className="text-teal-deep/30" />}
              </button>
              <p className="flex-1 text-teal-dark">{task.title}</p>
              {task.checkpoint_count > 0 && (
                <span className="text-xs text-teal-dark/40">
                  {task.checkpoint_done}/{task.checkpoint_count} {t('tasks.checkpoints')}
                </span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(task)} className="text-teal-dark/40 hover:text-teal-deep p-1">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(task.id)} className="text-teal-dark/40 hover:text-terracotta p-1">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {formMode === 'add' ? (
        <TaskForm t={t} title={title} setTitle={setTitle} priority={priority} setPriority={setPriority} onSave={handleSave} onCancel={resetForm} />
      ) : formMode === 'none' ? (
        <button onClick={startAdd} className="flex items-center gap-1.5 text-sm text-gold font-semibold">
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
    <div className="flex gap-2 pt-3 pb-2 border-t border-sage/20">
      <input placeholder={t('tasks.title')} value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 border border-sage/40 rounded-lg px-2.5 py-2 text-sm" />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-sage/40 rounded-lg px-2.5 py-2 text-sm">
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>
      <button onClick={onSave} className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-full">
        {t('tasks.save')}
      </button>
      <button onClick={onCancel} className="text-sm text-teal-dark/50 px-2 py-2">
        {t('vendors.cancel')}
      </button>
    </div>
  );
}