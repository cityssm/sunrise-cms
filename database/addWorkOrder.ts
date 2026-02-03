import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getCachedWorkOrderMilestoneTypes } from '../helpers/cache/workOrderMilestoneTypes.cache.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import addWorkOrderContract from './addWorkOrderContract.js'
import addWorkOrderMilestone from './addWorkOrderMilestone.js'
import getNextWorkOrderNumber from './getNextWorkOrderNumber.js'

export interface AddWorkOrderForm {
  workOrderDescription: string
  workOrderNumber?: string

  workOrderTypeId: number | string

  workOrderCloseDateString?: string
  workOrderOpenDateString?: string

  contractId?: string

  [workOrderMilestoneId: `workOrderMilestoneId_${number}`]: string | undefined

  [workOrderMilestoneDateString: `workOrderMilestoneDateString_${number}`]:
    | DateString
    | undefined
    
  [workOrderMilestoneTimeString: `workOrderMilestoneTimeString_${number}`]:
    | ''
    | TimeString
    | undefined

  [workOrderMilestoneDescription: `workOrderMilestoneDescription_${number}`]:
    | string
    | undefined
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
    .prepare(/* sql */ `insert into WorkOrders (
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

  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  for (const workOrderMilestoneType of workOrderMilestoneTypes) {
    const milestoneTypeId =
      workOrderForm[
        `workOrderMilestoneId_${workOrderMilestoneType.workOrderMilestoneTypeId}`
      ]
    const milestoneDateString =
      workOrderForm[
        `workOrderMilestoneDateString_${workOrderMilestoneType.workOrderMilestoneTypeId}`
      ]
    const milestoneTimeString =
      workOrderForm[
        `workOrderMilestoneTimeString_${workOrderMilestoneType.workOrderMilestoneTypeId}`
      ]
    const milestoneDescription =
      workOrderForm[
        `workOrderMilestoneDescription_${workOrderMilestoneType.workOrderMilestoneTypeId}`
      ]

    if ((milestoneTypeId ?? '') !== '') {
      addWorkOrderMilestone(
        {
          workOrderId,
          workOrderMilestoneTypeId: milestoneTypeId ?? '',

          workOrderMilestoneDateString: milestoneDateString ?? '',
          workOrderMilestoneTimeString: milestoneTimeString ?? '',

          workOrderMilestoneDescription: milestoneDescription ?? ''
        },
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return workOrderId
}
