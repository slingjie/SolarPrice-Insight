/**
 * TimeKey Utilities for PVGIS/Load Alignment
 * 
 * Provides deterministic time conversions and hour-key generation for 8760-hour models.
 * PVGIS inputs (UTC with minutes) are converted to China Time (+8) and floored to hour precision.
 */

/**
 * Convert ISO UTC timestamp to China hour key (MM-DD HH:00).
 * Extracts month, day, hour from UTC timestamp, adds 8 hours for China Time (+08:00),
 * handles day/month/year wrapping, and floors minutes to hour boundary.
 * 
 * @param isoUtc ISO string like "2005-01-01T00:10:00Z"
 * @returns Hour key like "01-01 08:00" (zero-padded)
 * @example
 * toChinaHourKeyFromIsoUtc("2005-01-01T00:10:00Z") // "01-01 08:00"
 * toChinaHourKeyFromIsoUtc("2005-01-01T23:30:00Z") // "01-02 07:00" (cross-day)
 */
export function toChinaHourKeyFromIsoUtc(isoUtc: string): string {
  const match = isoUtc.match(/(\d{2})-(\d{2})T(\d{2}):/);
  if (!match) throw new Error(`Invalid ISO UTC format: ${isoUtc}`);
  
  let month = parseInt(match[1], 10);
  let day = parseInt(match[2], 10);
  let hour = parseInt(match[3], 10);
  
  const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  hour += 8;
  
  if (hour >= 24) {
    hour -= 24;
    day += 1;
    
    if (day > DAYS_IN_MONTH[month - 1]) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
      }
    }
  }
  
  return toHourKeyFromMonthDayHour(month, day, hour);
}

/**
 * Create hour key from month, day, hour (all zero-padded).
 * 
 * @param month 1-12
 * @param day 1-31
 * @param hour 0-23
 * @returns Hour key like "01-01 08:00"
 */
export function toHourKeyFromMonthDayHour(month: number, day: number, hour: number): string {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  return `${monthStr}-${dayStr} ${hourStr}:00`;
}

/**
 * Convert month/day/hour to ISO Local string (YYYY-MM-DDTHH:00:00+08:00).
 * Used for display timestamps with fixed China timezone.
 * 
 * @param baseYear Year for the ISO string (typically 2021 for 8760-hour canonical calendar)
 * @param month 1-12
 * @param day 1-31
 * @param hour 0-23
 * @returns ISO Local string like "2021-01-01T08:00:00+08:00"
 */
export function toIsoLocalFromMonthDayHour(
  baseYear: number,
  month: number,
  day: number,
  hour: number
): string {
  const yearStr = String(baseYear);
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:00:00+08:00`;
}

/**
 * Parse hour key back to month/day/hour components.
 * Used for aggregation, filtering, and weekday calculations.
 * 
 * @param key Hour key like "01-15 08:00"
 * @returns Object with month (1-12), day (1-31), hour (0-23)
 * @throws Error if key format is invalid or values are out of range
 */
export function hourKeyToMonthDayHour(
  key: string
): { month: number; day: number; hour: number } {
  const match = key.match(/^(\d{2})-(\d{2})\s+(\d{2}):00$/);
  if (!match) {
    throw new Error(`Invalid hour key format: ${key}. Expected "MM-DD HH:00"`);
  }
  
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const hour = parseInt(match[3], 10);
  
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Expected 1-12`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}. Expected 1-31`);
  }
  if (hour < 0 || hour > 23) {
    throw new Error(`Invalid hour: ${hour}. Expected 0-23`);
  }
  
  return { month, day, hour };
}
