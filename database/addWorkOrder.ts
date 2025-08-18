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
  workOrderDescription: string
  workOrderNumber?: string

  workOrderTypeId: number | string

  workOrderCloseDateString?: string
  workOrderOpenDateString?: string

  contractId?: string
}

export default function addWorkOrder(
  workOrderForm: AddWorkOrderForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

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
        contractId: workOrderForm.contractId as string,
        workOrderId
      },
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return workOrderId
}
