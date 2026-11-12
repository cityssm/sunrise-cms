import type { Request, Response } from 'express'

import { updateWorkOrderStatHolidaySettings } from '../../helpers/statHolidays.helpers.js'

interface UpdateStatHolidaysForm {
  country: string
  region: string
  state: string
  types: string | string[]
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateStatHolidaysResponse =
  { success: boolean }

export default function handler(
  request: Request<unknown, unknown, UpdateStatHolidaysForm>,
  response: Response<DoUpdateStatHolidaysResponse>
): void {
  const selectedTypes =
    request.body.types === undefined
      ? []
      : Array.isArray(request.body.types)
        ? request.body.types
        : [request.body.types]

  updateWorkOrderStatHolidaySettings({
    country: request.body.country ?? '',
    region: request.body.region ?? '',
    state: request.body.state ?? '',
    types: selectedTypes
  })

  response.json({
    success: true
  })
}
