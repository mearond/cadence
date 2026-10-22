import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Persistent frame for staff pages: stays mounted while pages change underneath,
// so the sidebar's active marker can slide between items.
export default function StaffShell() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}
