import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

export default function handler(
  request: Request,
  response: Response
): void {
console.log(request.query.workdayDateString)

  response.render('workOrder-workday', {
    headTitle: 'Workday Report',
    workdayDateString:
      request.query.workdayDateString ?? dateToString(new Date())
  })
}
