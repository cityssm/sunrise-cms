/**
 * Converts separate year, month, and day parts into a YYYYMMDD integer.
 * Missing or zero month/day parts are stored as 00.
 * Returns undefined if no valid year is provided.
 * Note: day validation is limited to the range 1-31 regardless of month.
 */
export function datePartsToInteger(
  year: number | string,
  month: number | string,
  day: number | string
): number | undefined {
  const yearNum = Number(year)

  if (!yearNum || yearNum <= 0) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const monthNum = Math.max(0, Math.min(12, Number(month) || 0))
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const dayNum = Math.max(0, Math.min(31, Number(day) || 0))

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return yearNum * 10_000 + monthNum * 100 + dayNum
}

/**
 * Converts a YYYYMMDD integer to a display string.
 * Handles partial dates where month and/or day are zero.
 * - Year only (e.g. 19010000) → "1901"
 * - Year + month (e.g. 19010300) → "1901-03"
 * - Full date (e.g. 19010315) → "1901-03-15"
 */
export function partialDateIntegerToString(
  dateInteger: number | null | undefined
): string {
  if (!dateInteger || dateInteger <= 0) {
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const dateStr = `00000000${dateInteger.toString()}`.slice(-8)
  const year = dateStr.slice(0, 4)
  const month = dateStr.slice(4, 6)
  const day = dateStr.slice(6, 8)

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
 */
export function partialDateIntegerToYear(
  dateInteger: number | null | undefined
): number | undefined {
  if (!dateInteger || dateInteger <= 0) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return Math.floor(dateInteger / 10_000)
}

/**
 * Extracts the month (1-12, or 0 if unknown) from a YYYYMMDD partial date integer.
 */
export function partialDateIntegerToMonth(
  dateInteger: number | null | undefined
): number {
  if (!dateInteger || dateInteger <= 0) {
    return 0
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return Math.floor((dateInteger % 10_000) / 100)
}

/**
 * Extracts the day (1-31, or 0 if unknown) from a YYYYMMDD partial date integer.
 */
export function partialDateIntegerToDay(
  dateInteger: number | null | undefined
): number {
  if (!dateInteger || dateInteger <= 0) {
    return 0
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return dateInteger % 100
}
