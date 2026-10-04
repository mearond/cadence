// Gregorian <-> Ethiopian calendar conversion (display-only; all dates remain stored/input as Gregorian).
// Uses a Julian Day Number based conversion, verified against known reference dates
// (Meskerem 1, 2017 E.C. = September 11, 2024 Gregorian; leap-year New Year shift to Sept 12).

export const ETHIOPIAN_MONTHS_AM = [
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

// --- Ethiopian -> Gregorian (needed to build an Ethiopian-month calendar grid) ---

function addUTCDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

function utcISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Finds the Gregorian date (UTC midnight) for day 1 of the given Ethiopian year/month,
// by scanning forward from a date safely before the Ethiopian new year. Ethiopian
// Meskerem 1 of `ethYear` falls in Gregorian September of `ethYear + 7`, and the whole
// Ethiopian year (through Pagume) fits within the scan window below.
function findEthiopianMonthStart(ethYear: number, ethMonth: number): Date {
  let d = new Date(Date.UTC(ethYear + 7, 7, 20)); // ~Aug 20, safely before Meskerem 1
  for (let i = 0; i < 420; i++) {
    const e = toEthiopian(utcISO(d));
    if (e.year === ethYear && e.month === ethMonth && e.day === 1) {
      return d;
    }
    d = addUTCDays(d, 1);
  }
  throw new Error(`Could not resolve the start of Ethiopian month ${ethMonth}/${ethYear}`);
}

export function ethiopianToGregorian(ethYear: number, ethMonth: number, ethDay: number): Date {
  const monthStart = findEthiopianMonthStart(ethYear, ethMonth);
  return addUTCDays(monthStart, ethDay - 1);
}

// Pagume (month 13) has 5 days, or 6 in an Ethiopian leap year; every other month has 30.
export function daysInEthiopianMonth(ethYear: number, ethMonth: number): number {
  if (ethMonth !== 13) return 30;
  const monthStart = findEthiopianMonthStart(ethYear, 13);
  const day6 = addUTCDays(monthStart, 5);
  const e = toEthiopian(utcISO(day6));
  return e.year === ethYear && e.month === 13 && e.day === 6 ? 6 : 5;
}