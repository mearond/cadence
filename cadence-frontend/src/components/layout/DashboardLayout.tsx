import type { ReactNode } from 'react';

// Page body inside StaffShell. Each top-level section rises in, one after another
// (see .stagger in index.css).
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <main className="stagger flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-9">{children}</main>;
}
