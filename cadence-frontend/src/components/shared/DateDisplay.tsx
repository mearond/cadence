import { useTranslation } from 'react-i18next';
import { formatEthiopianDate } from '../../lib/ethiopianCalendar';

export default function DateDisplay({ iso, className }: { iso: string; className?: string }) {
  const { i18n } = useTranslation();

  const gregorian = new Date(iso).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (i18n.language !== 'am') {
    return <span className={className}>{gregorian}</span>;
  }

  return (
    <span className={className}>
      {formatEthiopianDate(iso)}
      <span className="block text-[10px] opacity-60 font-normal leading-tight">{gregorian}</span>
    </span>
  );
}