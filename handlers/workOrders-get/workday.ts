import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

export default function handler(
  request: Request,
  response: Response
): void {
  response.render('workOrders/workday', {
    headTitle: 'Workday Report',
    workdayDateString:
      request.query.workdayDateString ?? dateToString(new Date())
  })
}
