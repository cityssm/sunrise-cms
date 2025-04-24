import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { WorkOrderMilestoneType } from '../types/record.types.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default function getWorkOrderMilestoneTypes(): WorkOrderMilestoneType[] {
  const database = sqlite(sunriseDB)

  const workOrderMilestoneTypes = database
    .prepare(
      `select workOrderMilestoneTypeId, workOrderMilestoneType, orderNumber
        from WorkOrderMilestoneTypes
        where recordDelete_timeMillis is null
        order by orderNumber, workOrderMilestoneType`
    )
    .all() as WorkOrderMilestoneType[]

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

  database.close()

  return workOrderMilestoneTypes
}
