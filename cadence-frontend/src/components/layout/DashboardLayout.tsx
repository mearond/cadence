import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Page body inside StaffShell. Each page fades up once when it opens.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <motion.main
      className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-9"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}
