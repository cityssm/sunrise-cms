import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { WorkOrderStatus } from '../types/record.types.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default function getWorkOrderStatuses(
  connectedDatabase?: sqlite.Database
): WorkOrderStatus[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const workOrderStatuses = database
    .prepare(/* sql */ `
      SELECT
        workOrderStatusId,
        workOrderStatus,
        orderNumber
      FROM
        WorkOrderStatuses
      WHERE
        recordDelete_timeMillis IS NULL
      ORDER BY
        orderNumber,
        workOrderStatus
    `)
    .all() as WorkOrderStatus[]

  let expectedOrderNumber = 0

  for (const workOrderStatus of workOrderStatuses) {
    if (workOrderStatus.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'WorkOrderStatuses',
        workOrderStatus.workOrderStatusId,
        expectedOrderNumber,
        database
      )

      workOrderStatus.orderNumber = expectedOrderNumber
    }

    expectedOrderNumber += 1
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return workOrderStatuses
}
