import type { ReactNode } from 'react';

// Title row at the top of each list page.
export default function PageHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-none font-semibold text-teal-dark">{title}</h1>
        {subtitle && <p className="mt-2.5 text-[15px] text-teal-dark/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
