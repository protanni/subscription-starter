// lib/dates/timezone.ts
import 'server-only';

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { addDays, startOfWeek } from 'date-fns';

export type DateKey = `${number}-${number}-${number}`; // YYYY-MM-DD
export type UtcRange = { startUtc: string; endUtc: string };

/**
 * Returns today's date key (YYYY-MM-DD) in the user's timezone.
 */
export function getUserToday(timezone: string): DateKey {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd') as DateKey;
}

/**
 * Returns the UTC range for a given user-local day.
 * Range is [startUtc, endUtc) (end exclusive).
 */
export function getUserDayRangeUtc(timezone: string, dateKey: DateKey): UtcRange {
  const startUtc = fromZonedTime(`${dateKey}T00:00:00`, timezone).toISOString();

  const base = new Date(`${dateKey}T00:00:00`);
  const next = addDays(base, 1);
  const nextKey = formatInTimeZone(next, timezone, 'yyyy-MM-dd') as DateKey;

  const endUtc = fromZonedTime(`${nextKey}T00:00:00`, timezone).toISOString();

  return { startUtc, endUtc };
}

/**
 * Returns the UTC range for the user's current week (Monday start).
 * Range is [startUtc, endUtc) (end exclusive).
 */
export function getUserWeekRangeUtc(
  timezone: string,
  baseDateKey?: DateKey
): UtcRange & { startKey: DateKey; endKey: DateKey } {
  const baseKey = baseDateKey ?? getUserToday(timezone);
  const base = new Date(`${baseKey}T00:00:00`);

  // Week starts on Monday
  const weekStartLocal = startOfWeek(base, { weekStartsOn: 1 });
  const startKey = formatInTimeZone(weekStartLocal, timezone, 'yyyy-MM-dd') as DateKey;

  const endLocal = addDays(new Date(`${startKey}T00:00:00`), 7);
  const endKey = formatInTimeZone(endLocal, timezone, 'yyyy-MM-dd') as DateKey;

  const startUtc = fromZonedTime(`${startKey}T00:00:00`, timezone).toISOString();
  const endUtc = fromZonedTime(`${endKey}T00:00:00`, timezone).toISOString();

  return { startUtc, endUtc, startKey, endKey };
}
