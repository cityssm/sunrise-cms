/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * Converts separate year, month, and day parts into a YYYYMMDD integer.
 * Missing or zero month/day parts are stored as 00.
 * Returns undefined if no valid year is provided.
 * Note: day validation is limited to the range 1-31 regardless of month.
 * @param year - required year part (must be a positive integer)
 * @param month - optional month part (1-12, or 0 if unknown)
 * @param day - optional day part (1-31, or 0 if unknown)
 * @returns YYYYMMDD integer or undefined if year is invalid
 */
export function datePartsToInteger(
  year: number | string,
  month: number | string,
  day: number | string
): number | undefined {
  const yearNumber = Number(year)

  if (!yearNumber || yearNumber <= 0) {
    return undefined
  }

  const monthNumber = Math.max(0, Math.min(12, Number(month) || 0))

  const dayNumber = Math.max(0, Math.min(31, Number(day) || 0))

  return yearNumber * 10_000 + monthNumber * 100 + dayNumber
}

/**
 * Converts a YYYYMMDD integer to a display string.
 * Handles partial dates where month and/or day are zero.
 * - Year only (e.g. 19010000) → "1901"
 * - Year + month (e.g. 19010300) → "1901-03"
 * - Full date (e.g. 19010315) → "1901-03-15"
 * @param dateInteger - integer in YYYYMMDD format, where month and day can be zero for unknown values
 * @returns display string for the partial date, or empty string if input is invalid
 */
export function partialDateIntegerToString(
  dateInteger: number | null | undefined
): string {
  if (!dateInteger || dateInteger <= 0) {
    return ''
  }

  const dateString = `00000000${dateInteger.toString()}`.slice(-8)
  const year = dateString.slice(0, 4)
  const month = dateString.slice(4, 6)
  const day = dateString.slice(6, 8)

  if (month === '00') {
    return year
  }

  if (day === '00') {
    return `${year}-${month}`
  }

  return `${year}-${month}-${day}`
}

/**
 * Extracts the year from a YYYYMMDD partial date integer.
 * @param dateInteger - integer in YYYYMMDD format, where month and day can be zero for unknown values
 * @returns year part as a number, or undefined if input is invalid
 */
export function partialDateIntegerToYear(
  dateInteger: number | null | undefined
): number | undefined {
  if (!dateInteger || dateInteger <= 0) {
    return undefined
  }

  return Math.floor(dateInteger / 10_000)
}

/**
 * Extracts the month (1-12, or 0 if unknown) from a YYYYMMDD partial date integer.
 * @param dateInteger - integer in YYYYMMDD format, where month and day can be zero for unknown values
 * @returns month part as a number (1-12), or 0 if unknown, or undefined if input is invalid
 */
export function partialDateIntegerToMonth(
  dateInteger: number | null | undefined
): number {
  if (!dateInteger || dateInteger <= 0) {
    return 0
  }

  return Math.floor((dateInteger % 10_000) / 100)
}

/**
 * Extracts the day (1-31, or 0 if unknown) from a YYYYMMDD partial date integer.
 * @param dateInteger - integer in YYYYMMDD format, where month and day can be zero for unknown values
 * @returns day part as a number (1-31), or 0 if unknown, or undefined if input is invalid
 */
export function partialDateIntegerToDay(
  dateInteger: number | null | undefined
): number {
  if (!dateInteger || dateInteger <= 0) {
    return 0
  }

  return dateInteger % 100
}
