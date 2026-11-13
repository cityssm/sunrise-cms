/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { DateString, TimeString } from '@cityssm/utils-datetime'

export const user: User = {
  username: 'import.unix',
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
  let formattedYear = `0000${year}`.slice(-4)

  if (formattedYear === '3014') {
    formattedYear = '2014'
  } else if (formattedYear === '2202') {
    formattedYear = '2022'
  }

  const formattedMonth = `00${month}`.slice(-2)
  const formattedDay = `00${day}`.slice(-2)

  return `${formattedYear}-${formattedMonth}-${formattedDay}` as DateString
}

export function formatTimeString(hour: string, minute: string): TimeString {
  const formattedHour = `00${hour}`.slice(-2)
  const formattedMinute = `00${minute}`.slice(-2)

  return `${formattedHour}:${formattedMinute}` as TimeString
}

export function formatContractNumber(
  workOrderNumber: string,
  preneedOrderNumber: string,
  intermentNumber: string
): string | undefined {
  let contractNumber: string | undefined

  if (workOrderNumber.trim() !== '') {
    let trimmedWorkOrderNumber = workOrderNumber.trim()

    if (trimmedWorkOrderNumber.length < 6) {
      trimmedWorkOrderNumber = `000000${trimmedWorkOrderNumber}`.slice(-6)
    }

    contractNumber = `UNIX-WO-${trimmedWorkOrderNumber}`
  }

  if (preneedOrderNumber.trim() !== '') {
    let trimmedPreneedOrderNumber = preneedOrderNumber.trim()

    if (trimmedPreneedOrderNumber.length < 6) {
      trimmedPreneedOrderNumber = `000000${trimmedPreneedOrderNumber}`.slice(-6)
    }

    contractNumber = `UNIX-PN-${trimmedPreneedOrderNumber}`
  }

  if (contractNumber !== undefined && intermentNumber.trim() !== '' && intermentNumber.trim() !== '0') {
    contractNumber += `-${intermentNumber.trim()}`
  }

  return contractNumber
}
