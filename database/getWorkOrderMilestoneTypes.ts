import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { WorkOrderMilestoneType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getWorkOrderMilestoneTypes(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): WorkOrderMilestoneType[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const updateOrderNumbers = !includeDeleted

  const workOrderMilestoneTypes = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        workOrderMilestoneTypeId,
        workOrderMilestoneType,
        orderNumber
      FROM
        WorkOrderMilestoneTypes ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        workOrderMilestoneType
    `)
    .all() as unknown as WorkOrderMilestoneType[]

  if (updateOrderNumbers) {
    let expectedOrderNumber = 0

    for (const workOrderMilestoneType of workOrderMilestoneTypes) {
      if (workOrderMilestoneType.orderNumber !== expectedOrderNumber) {
        updateRecordOrderNumber(
          'WorkOrderMilestoneTypes',
          workOrderMilestoneType.workOrderMilestoneTypeId,
          expectedOrderNumber,
          database
        )

        workOrderMilestoneType.orderNumber = expectedOrderNumber
      }

      expectedOrderNumber += 1
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return workOrderMilestoneTypes
}
