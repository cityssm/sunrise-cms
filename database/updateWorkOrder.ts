import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateWorkOrderForm {
  workOrderId: string
  workOrderNumber: string

  workOrderDescription: string
  workOrderOpenDateString: DateString
  workOrderTypeId: string
}

export default async function updateWorkOrder(
  workOrderForm: UpdateWorkOrderForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update WorkOrders
        set workOrderNumber = ?,
        workOrderTypeId = ?,
        workOrderDescription = ?,
        workOrderOpenDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderId = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      workOrderForm.workOrderNumber,
      workOrderForm.workOrderTypeId,
      workOrderForm.workOrderDescription,
      dateStringToInteger(workOrderForm.workOrderOpenDateString),
      user.userName,
      Date.now(),
      workOrderForm.workOrderId
    )

  database.release()

  return result.changes > 0
}
