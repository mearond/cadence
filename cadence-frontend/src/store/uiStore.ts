import { create } from 'zustand';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem('cadence_sidebar_collapsed') === '1';
  } catch {
    return false;
  }
}

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Phone-sized screens: the sidebar slides in over the page.
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: readCollapsed(),
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed;
      try {
        localStorage.setItem('cadence_sidebar_collapsed', next ? '1' : '0');
      } catch {
        // storage unavailable: the choice just won't be remembered
      }
      return { sidebarCollapsed: next };
    }),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
