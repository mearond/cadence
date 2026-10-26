import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Presentation, GraduationCap } from 'lucide-react';
import { ethiopianDateParts } from '../../lib/today';

// Decorative composition for the sign-in panel: a large woven diamond emblem
// (the tilet motif, enlarged) with three calendar leaves floating over it.

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Emblem() {
  // Concentric stepped diamonds, drawn in from the centre out.
  const rings = [
    { r: 46, w: 1.6, o: 0.9 },
    { r: 78, w: 1, o: 0.55 },
    { r: 112, w: 1.4, o: 0.75 },
    { r: 146, w: 0.8, o: 0.4 },
    { r: 180, w: 1.2, o: 0.5 },
  ];
  return (
    <svg viewBox="-200 -200 400 400" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {rings.map((ring, i) => (
        <motion.path
          key={ring.r}
          d={`M0 ${-ring.r} L${ring.r} 0 L0 ${ring.r} L${-ring.r} 0 Z`}
          fill="none"
          stroke="#c4902d"
          strokeWidth={ring.w}
          strokeOpacity={ring.o}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {/* small diamonds stitched along the middle ring, like the band's beads */}
      {Array.from({ length: 16 }, (_, i) => {
        const side = Math.floor(i / 4);
        const tPos = (i % 4) / 4 + 0.125;
        const corners = [
          [0, -112],
          [112, 0],
          [0, 112],
          [-112, 0],
        ];
        const [x1, y1] = corners[side];
        const [x2, y2] = corners[(side + 1) % 4];
        const x = x1 + (x2 - x1) * tPos;
        const y = y1 + (y2 - y1) * tPos;
        return (
          <motion.path
            key={i}
            d={`M${x} ${y - 5} L${x + 5} ${y} L${x} ${y + 5} L${x - 5} ${y} Z`}
            fill="#ecca83"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ delay: 1 + i * 0.04, type: 'spring', stiffness: 400, damping: 18 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      <motion.path
        d="M0 -18 L18 0 L0 18 L-18 0 Z"
        fill="#c4902d"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 16 }}
      />
    </svg>
  );
}

function Leaf({
  date,
  type,
  icon: Icon,
  className,
  delay,
  floatY,
  rotate,
}: {
  date: Date;
  type: string;
  icon: typeof Heart;
  className: string;
  delay: number;
  floatY: number;
  rotate: number;
}) {
  const { t, i18n } = useTranslation();
  const isAm = i18n.language === 'am';
  const eth = ethiopianDateParts(iso(date), i18n.language);
  const month = isAm ? eth.month : date.toLocaleDateString('en-US', { month: 'short' });
  const day = isAm ? eth.day : date.getDate();

  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 30, rotate: rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -floatY, 0] }}
        transition={{ duration: 5 + floatY / 4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.8 }}
        className="w-[30cqw] rounded-[4.5cqw] overflow-hidden bg-paper text-teal-dark shadow-[0_24px_50px_-18px_rgb(0_0_0/0.6)]"
      >
        <div className="bg-gold text-teal-ink text-center text-[3.6cqw] font-semibold py-[1.8cqw]">{month}</div>
        <div className="text-center font-display font-semibold leading-none text-[11.5cqw] pt-[3.4cqw] pb-[2.2cqw]">{day}</div>
        <div className="flex items-center justify-center gap-[1.2cqw] pb-[3cqw] px-[2cqw] text-[3.2cqw] font-medium text-teal-dark/60 whitespace-nowrap">
          <Icon className="w-[3cqw] h-[3cqw] text-teal-deep shrink-0" />
          {t(`eventsPage.type.${type}`)}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AuthArt() {
  return (
    <div className="relative w-full h-full [container-type:size]">
      <Emblem />
      <Leaf date={addDays(4)} type="wedding" icon={Heart} className="left-[0%] top-[6%]" delay={0.9} floatY={10} rotate={-8} />
      <Leaf date={addDays(11)} type="conference" icon={Presentation} className="right-[0%] top-[30%]" delay={1.1} floatY={14} rotate={6} />
      <Leaf date={addDays(23)} type="graduation" icon={GraduationCap} className="left-[20%] bottom-[0%]" delay={1.3} floatY={8} rotate={-3} />
    </div>
  );
}
