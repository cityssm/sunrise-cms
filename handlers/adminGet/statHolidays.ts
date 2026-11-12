import type { Request, Response } from 'express'

import { i18next } from '../../helpers/i18n.helpers.js'
import {
  getHolidayLocationOptions,
  getHolidayTypeLabels,
  getHolidayTypes,
  getUpcomingStatHolidays,
  getWorkOrderStatHolidaySettings
} from '../../helpers/statHolidays.helpers.js'

export default function handler(_request: Request, response: Response): void {
  const statHolidaySettings = getWorkOrderStatHolidaySettings()

  const holidayLocationOptions = getHolidayLocationOptions(statHolidaySettings)

  const upcomingStatHolidays = getUpcomingStatHolidays(statHolidaySettings)

  response.render('admin/statHolidays', {
    countryOptions: holidayLocationOptions.countries,
    headTitle: i18next.t('admin:statHolidayManagement', {
      lng: response.locals.lng
    }),
    holidayTypeLabels: getHolidayTypeLabels(),
    holidayTypes: getHolidayTypes(),
    ignoredDateStrings: statHolidaySettings.ignoredDateStrings,
    regionOptions: holidayLocationOptions.regions,
    statHolidaySettings,
    stateOptions: holidayLocationOptions.states,
    upcomingStatHolidays
  })
}
