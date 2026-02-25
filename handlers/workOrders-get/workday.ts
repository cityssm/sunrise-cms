import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(
  request: Request,
  response: Response
): void {
  response.render('workOrders/workday', {
    headTitle: i18next.t('workOrders:workdayReport', { lng: response.locals.lng }),
    workdayDateString:
      request.query.workdayDateString ?? dateToString(new Date())
  })
}
