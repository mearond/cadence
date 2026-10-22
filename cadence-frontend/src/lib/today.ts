import { toEthiopian, ETHIOPIAN_MONTHS_AM } from './ethiopianCalendar';

// Transliterated Ethiopian month names, for showing the Ethiopian date in English.
const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit',
  'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
];

function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ethiopianDateParts(iso: string, lang: string) {
  const e = toEthiopian(iso);
  const month = lang === 'am' ? ETHIOPIAN_MONTHS_AM[e.month - 1] : ETHIOPIAN_MONTHS_EN[e.month - 1];
  return { day: e.day, month, year: e.year };
}

// Today's date in both calendars. The viewer's language decides which one leads.
export function todayInBothCalendars(lang: string, now = new Date()) {
  const iso = localISO(now);
  const eth = ethiopianDateParts(iso, lang);
  const ethLabel = `${eth.month} ${eth.day}, ${eth.year}`;
  const gregLabel = now.toLocaleDateString(lang === 'am' ? 'en-GB' : 'en-US', {
    weekday: lang === 'am' ? undefined : 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return lang === 'am'
    ? { primary: ethLabel, secondary: gregLabel, eth, iso }
    : { primary: gregLabel, secondary: ethLabel, eth, iso };
}
