import {
  type DateString,
  dateStringToInteger,
  dateToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import addWorkOrderContract from './addWorkOrderContract.js'
import getNextWorkOrderNumber from './getNextWorkOrderNumber.js'

export interface AddWorkOrderForm {
  workOrderTypeId: number | string
  workOrderNumber?: string
  workOrderDescription: string
  workOrderOpenDateString?: string
  workOrderCloseDateString?: string
  contractId?: string
}

export default function addWorkOrder(
  workOrderForm: AddWorkOrderForm,
  user: User
): number {
  const database = sqlite(sunriseDB)

  const rightNow = new Date()

  let workOrderNumber = workOrderForm.workOrderNumber

  if ((workOrderNumber ?? '') === '') {
    workOrderNumber = getNextWorkOrderNumber(database)
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

  if ((workOrderForm.contractId ?? '') !== '') {
    addWorkOrderContract(
      {
        workOrderId,
        contractId: workOrderForm.contractId as string
      },
      user,
      database
    )
  }

  database.close()

  return workOrderId
}
