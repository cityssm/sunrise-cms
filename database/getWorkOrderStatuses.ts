import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { WorkOrderStatus } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getWorkOrderStatuses(
  connectedDatabase?: DatabaseSync
): WorkOrderStatus[] {
  const database = connectedDatabase ?? getDatabaseConnection()

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
    .all() as unknown as WorkOrderStatus[]

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
