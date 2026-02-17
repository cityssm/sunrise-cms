/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { DateString, TimeString } from '@cityssm/utils-datetime'

export const user: User = {
  userName: 'import.unix',
  userProperties: {
    canUpdateCemeteries: true,
    canUpdateContracts: true,
    canUpdateWorkOrders: true,
    isAdmin: false
  },
  userSettings: {}
}

export function formatDateString(
  year: string,
  month: string,
  day: string
): DateString {
  const formattedYear = `0000${year}`.slice(-4)
  const formattedMonth = `00${month}`.slice(-2)
  const formattedDay = `00${day}`.slice(-2)

  return `${formattedYear}-${formattedMonth}-${formattedDay}` as DateString
}

export function formatTimeString(hour: string, minute: string): TimeString {
  const formattedHour = `00${hour}`.slice(-2)
  const formattedMinute = `00${minute}`.slice(-2)

  return `${formattedHour}:${formattedMinute}` as TimeString
}
