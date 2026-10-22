import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Tilet from './Tilet';

interface Props {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  width?: 'sm' | 'md';
}

// Dialog shell shared by every pop-up form: dims the page, springs the panel in,
// closes on Escape or a click outside.
export default function Modal({ title, onClose, children, width = 'sm' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-teal-ink/45 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${width === 'md' ? 'sm:max-w-md' : 'sm:max-w-sm'} max-h-[92vh] overflow-y-auto bg-paper rounded-t-3xl sm:rounded-3xl shadow-[0_30px_80px_-20px_rgb(10_40_38/0.55)]`}
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        <Tilet className="h-2 rounded-t-3xl" />
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-2">
          <h2 className="font-display text-xl font-semibold text-teal-dark">{title}</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
