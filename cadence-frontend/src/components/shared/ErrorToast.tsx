import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

// Safety net for any request a page didn't catch itself (a save that fails
// validation, a 403 for a role, the API being down). Instead of an uncaught
// error in the console and a button that silently does nothing, the person
// sees the server's message.
function messageFor(reason: unknown): string | null {
  if (axios.isAxiosError(reason)) {
    if (reason.response?.status === 401) return null; // handled by the api interceptor (signs out)
    if (!reason.response) return 'Could not reach the server. Check your connection and try again.';
    return reason.response.data?.error || 'Something went wrong. Please try again.';
  }
  return null;
}

export default function ErrorToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onRejection = (e: PromiseRejectionEvent) => {
      const text = messageFor(e.reason);
      if (!text) return;
      e.preventDefault();
      setMessage(text);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 6000);
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-red-200 text-red-700 text-sm rounded-full shadow-lg pl-5 pr-3 py-2.5 max-w-[calc(100%-2rem)]"
    >
      <span>{message}</span>
      <button onClick={() => setMessage(null)} aria-label="Dismiss" className="p-1 rounded-full hover:bg-red-50">
        <X size={14} />
      </button>
    </div>
  );
}
