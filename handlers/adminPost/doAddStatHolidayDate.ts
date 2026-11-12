import type { Request, Response } from 'express'

import { addWorkOrderStatHolidayDate } from '../../helpers/statHolidays.helpers.js'

interface AddStatHolidayDateForm {
  dateString: string
  settingKey: 'additionalDates' | 'ignoredDates'
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddStatHolidayDateResponse =
  { success: boolean }

export default function handler(
  request: Request<unknown, unknown, AddStatHolidayDateForm>,
  response: Response<DoAddStatHolidayDateResponse>
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

  addWorkOrderStatHolidayDate(request.body.settingKey, request.body.dateString)

  response.json({
    success: true
  })
}
