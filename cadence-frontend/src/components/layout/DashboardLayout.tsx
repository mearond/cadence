import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-cream">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-8 bg-gradient-to-b from-teal-deep/[0.04] to-transparent">{children}</main>
      </div>
    </div>
  );
}