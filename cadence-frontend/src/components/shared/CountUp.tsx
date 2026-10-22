import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

// Counts from 0 up to `value` when it first appears, and between values when it changes.
export default function CountUp({ value, duration = 1.1 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = String(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    from.current = value;
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span ref={ref}>{reduce ? value : 0}</span>;
}
