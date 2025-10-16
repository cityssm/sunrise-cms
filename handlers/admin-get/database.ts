import {
  dateToString,
  dateToTimePeriodString
} from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getLastBackupDate } from '../../helpers/database.helpers.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const lastBackupDate = await getLastBackupDate()

  const lastBackupDateString =
    lastBackupDate === undefined ? '' : dateToString(lastBackupDate)

  const lastBackupTimePeriodString =
    lastBackupDate === undefined ? '' : dateToTimePeriodString(lastBackupDate)

  response.render('admin/database', {
    headTitle: 'Database Maintenance',
    lastBackupDateString,
    lastBackupTimePeriodString
  })
}
