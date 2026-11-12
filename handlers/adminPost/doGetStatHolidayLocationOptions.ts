import type { Request, Response } from 'express'

import { getHolidayLocationOptionsByCountryState } from '../../helpers/statHolidays.helpers.js'

interface GetStatHolidayLocationOptionsForm {
  country: string
  state: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetStatHolidayLocationOptionsResponse = {
  countries: Record<string, string>
  regions: Record<string, string>
  states: Record<string, string>
  success: boolean
}

export default function handler(
  request: Request<unknown, unknown, GetStatHolidayLocationOptionsForm>,
  response: Response<DoGetStatHolidayLocationOptionsResponse>
): void {
  const locationOptions = getHolidayLocationOptionsByCountryState(
    request.body.country ?? '',
    request.body.state ?? ''
  )

  response.json({
    ...locationOptions,
    success: true
  })
}
