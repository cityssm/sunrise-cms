import {
  type DateString,
  dateStringToInteger,
  dateToInteger
} from '@cityssm/utils-datetime'

import addWorkOrderBurialSiteContract from './addWorkOrderBurialSiteContract.js'
import getNextWorkOrderNumber from './getNextWorkOrderNumber.js'
import { acquireConnection } from './pool.js'

export interface AddWorkOrderForm {
  workOrderTypeId: number | string
  workOrderNumber?: string
  workOrderDescription: string
  workOrderOpenDateString?: string
  workOrderCloseDateString?: string
  burialSiteContractId?: string
}

export default async function addWorkOrder(
  workOrderForm: AddWorkOrderForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNow = new Date()

  let workOrderNumber = workOrderForm.workOrderNumber

  if ((workOrderNumber ?? '') === '') {
    workOrderNumber = await getNextWorkOrderNumber(database)
  }

  const result = database
    .prepare(
      `insert into WorkOrders (
        workOrderTypeId, workOrderNumber, workOrderDescription,
        workOrderOpenDate, workOrderCloseDate,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      workOrderForm.workOrderTypeId,
      workOrderNumber,
      workOrderForm.workOrderDescription,
      (workOrderForm.workOrderOpenDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(
            workOrderForm.workOrderOpenDateString as DateString
          ),
      (workOrderForm.workOrderCloseDateString ?? '') === ''
        ? undefined
        : dateStringToInteger(
            workOrderForm.workOrderCloseDateString as DateString
          ),
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  const workOrderId = result.lastInsertRowid as number

  if ((workOrderForm.burialSiteContractId ?? '') !== '') {
    await addWorkOrderBurialSiteContract(
      {
        workOrderId,
        burialSiteContractId: workOrderForm.burialSiteContractId as string
      },
      user,
      database
    )
  }

  database.release()

  return workOrderId
}
