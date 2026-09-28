import { useAuthStore } from '../store/authStore';

export default function ClientPortal() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-teal-dark mb-2">Welcome, {user?.name}</h1>
        <p className="text-sm text-teal-dark/50">Your event portal is coming soon.</p>
      </div>
    </div>
  );
}