// Gregorian -> Ethiopian calendar conversion (display-only; all dates remain stored/input as Gregorian).
// Uses a Julian Day Number based conversion, verified against known reference dates
// (Meskerem 1, 2017 E.C. = September 11, 2024 Gregorian; leap-year New Year shift to Sept 12).

const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

export interface EthiopianDate {
  year: number;
  month: number; // 1-13 (13 = Pagume)
  day: number;
}

export function toEthiopian(isoDate: string): EthiopianDate {
  const d = new Date(isoDate);
  // Use UTC getters so a plain "YYYY-MM-DD" string doesn't shift a day
  // depending on the viewer's local timezone.
  const jdn = gregorianToJDN(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  const r = (jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export function formatEthiopianDate(isoDate: string): string {
  const { year, month, day } = toEthiopian(isoDate);
  return `${ETHIOPIAN_MONTHS_AM[month - 1]} ${day}, ${year}`;
}