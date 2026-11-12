import type { Request, Response } from 'express'

import { removeWorkOrderStatHolidayDate } from '../../helpers/statHolidays.helpers.js'

interface RemoveStatHolidayDateForm {
  dateString: string
  settingKey: 'additionalDates' | 'ignoredDates'
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoRemoveStatHolidayDateResponse =
  { success: boolean }

export default function handler(
  request: Request<unknown, unknown, RemoveStatHolidayDateForm>,
  response: Response<DoRemoveStatHolidayDateResponse>
): void {
  if (
    request.body.settingKey !== 'additionalDates' &&
    request.body.settingKey !== 'ignoredDates'
  ) {
    response.json({
      success: false
    })
    return
  }

  removeWorkOrderStatHolidayDate(request.body.settingKey, request.body.dateString)

  response.json({
    success: true
  })
}
