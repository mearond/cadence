import { useId } from 'react';

interface Props {
  className?: string;
  // Tile height in px; the band repeats the motif along its length.
  size?: number;
  vertical?: boolean;
  tone?: 'teal' | 'ink' | 'gold';
  // Weave the band in on mount (the app's one signature load animation).
  weave?: boolean;
}

const tones = {
  teal: { base: '#135f5a', line: '#c4902d', fill: '#ecca83', accent: '#93b88f' },
  ink: { base: '#0a2826', line: '#c4902d', fill: '#c4902d', accent: '#135f5a' },
  gold: { base: '#c4902d', line: '#0a2826', fill: '#0e3735', accent: '#ecca83' },
};

// A woven border inspired by tilet, the embroidered band on a habesha kemis:
// a run of stepped diamonds between two fine rails.
export default function Tilet({ className = '', size = 8, vertical = false, tone = 'teal', weave = false }: Props) {
  const id = useId().replace(/:/g, '');
  const c = tones[tone];
  const k = size / 12;
  return (
    <svg
      aria-hidden="true"
      className={`block ${vertical ? 'h-full' : 'w-full'} ${weave ? (vertical ? 'tilet-weave-y' : 'tilet-weave') : ''} ${className}`}
      style={vertical ? { width: size } : { height: size }}
      preserveAspectRatio="none"
    >
      <defs>
        {/* The motif is drawn horizontally; the vertical band swaps x and y with a matrix
            (a mirror, so it tiles from the top-left with no offset). */}
        <pattern
          id={id}
          width={vertical ? 12 : 24}
          height={vertical ? 24 : 12}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${k})`}
        >
          <g transform={vertical ? 'matrix(0 1 1 0 0 0)' : undefined}>
            <rect width="24" height="12" fill={c.base} />
            <rect y="0.6" width="24" height="0.7" fill={c.line} opacity="0.9" />
            <rect y="10.7" width="24" height="0.7" fill={c.line} opacity="0.9" />
            <path d="M12 2.2 L18 6 L12 9.8 L6 6 Z" fill="none" stroke={c.line} strokeWidth="1" />
            <path d="M12 4.2 L14.8 6 L12 7.8 L9.2 6 Z" fill={c.fill} />
            <path d="M0 3.6 L3.4 6 L0 8.4 Z M24 3.6 L20.6 6 L24 8.4 Z" fill={c.accent} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
