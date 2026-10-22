// Chip colours for event statuses, shared by every list and header.
export const EVENT_STATUS_CHIP: Record<string, string> = {
  planning: 'bg-gold-light/45 text-[#7a5a14]',
  confirmed: 'bg-sage-light text-teal-deep',
  'in-progress': 'bg-teal-deep text-white',
  completed: 'bg-teal-dark text-sage-light',
  cancelled: 'bg-teal-dark/[0.07] text-teal-dark/50',
};

// The same statuses on a dark (teal) background.
export const EVENT_STATUS_CHIP_ON_DARK: Record<string, string> = {
  planning: 'bg-gold-light text-teal-ink',
  confirmed: 'bg-sage-light text-teal-dark',
  'in-progress': 'bg-white text-teal-deep',
  completed: 'bg-white/15 text-white',
  cancelled: 'bg-white/10 text-white/60',
};
