import type { WorkOrderType } from '../types/record.types.js'

import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default async function getWorkOrderTypes(): Promise<WorkOrderType[]> {
  const database = await acquireConnection()

  const workOrderTypes = database
    .prepare(
      `select workOrderTypeId, workOrderType, orderNumber
        from WorkOrderTypes
        where recordDelete_timeMillis is null
        order by orderNumber, workOrderType`
    )
    .all() as WorkOrderType[]

  let expectedOrderNumber = 0

  for (const workOrderType of workOrderTypes) {
    if (workOrderType.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'WorkOrderTypes',
        workOrderType.workOrderTypeId,
        expectedOrderNumber,
        database
      )

      workOrderType.orderNumber = expectedOrderNumber
    }

    expectedOrderNumber += 1
  }

  database.release()

  return workOrderTypes
}
