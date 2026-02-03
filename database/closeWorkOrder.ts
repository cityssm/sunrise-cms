import {
  type DateString,
  dateStringToInteger,
  dateToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface CloseWorkOrderForm {
  workOrderId: number | string

  workOrderCloseDateString?: '' | DateString
}

export default function closeWorkOrder(
  workOrderForm: CloseWorkOrderForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNow = new Date()

  const result = database
    .prepare(/* sql */ `
      UPDATE WorkOrders
      SET
        workOrderCloseDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderId = ?
    `)
    .run(
      workOrderForm.workOrderCloseDateString
        ? dateStringToInteger(workOrderForm.workOrderCloseDateString)
        : dateToInteger(new Date()),
      user.userName,
      rightNow.getTime(),
      workOrderForm.workOrderId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
