

import { dateIntegerToString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { WorkOrder } from '../types/record.types.js'

import getBurialSites from './getBurialSites.js'
import getContracts from './getContracts.js'
import getWorkOrderComments from './getWorkOrderComments.js'
import getWorkOrderMilestones from './getWorkOrderMilestones.js'

interface WorkOrderOptions {
  includeBurialSites: boolean
  includeComments: boolean
  includeMilestones: boolean
}

const baseSQL = `select w.workOrderId,
    w.workOrderTypeId, t.workOrderType,
    w.workOrderNumber, w.workOrderDescription,
    w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
    w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
    w.recordCreate_timeMillis, w.recordUpdate_timeMillis
    from WorkOrders w
    left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId
    where w.recordDelete_timeMillis is null`

export default async function getWorkOrder(
  workOrderId: number | string,
  options: WorkOrderOptions,
  connectedDatabase?: sqlite.Database
): Promise<WorkOrder | undefined> {
  return await _getWorkOrder(
    `${baseSQL} and w.workOrderId = ?`,
    workOrderId,
    options,
    connectedDatabase
  )
}

export async function getWorkOrderByWorkOrderNumber(
  workOrderNumber: string
): Promise<WorkOrder | undefined> {
  return await _getWorkOrder(
    `${baseSQL} and w.workOrderNumber = ?`,
    workOrderNumber,
    {
      includeBurialSites: true,
      includeComments: true,
      includeMilestones: true
    }
  )
}

async function _getWorkOrder(
  sql: string,
  workOrderIdOrWorkOrderNumber: number | string,
  options: WorkOrderOptions,
  connectedDatabase?: sqlite.Database
): Promise<WorkOrder | undefined> {
  const database = connectedDatabase ?? (sqlite(sunriseDB))

  database.function('userFn_dateIntegerToString', dateIntegerToString)

  const workOrder = database.prepare(sql).get(workOrderIdOrWorkOrderNumber) as
    | WorkOrder
    | undefined

  if (workOrder !== undefined) {
    if (options.includeBurialSites) {
      const burialSiteResults = getBurialSites(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          includeContractCount: false,
          limit: -1,
          offset: 0
        },
        database
      )

      workOrder.workOrderBurialSites = burialSiteResults.burialSites

      const workOrderContractsResults = await getContracts(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          includeFees: false,
          includeInterments: true,
          includeTransactions: false,
          limit: -1,
          offset: 0
        },
        database
      )

      workOrder.workOrderContracts = workOrderContractsResults.contracts
    }

    if (options.includeComments) {
      workOrder.workOrderComments = await getWorkOrderComments(
        workOrder.workOrderId,
        database
      )
    }

    if (options.includeMilestones) {
      workOrder.workOrderMilestones = await getWorkOrderMilestones(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          includeWorkOrders: false,
          orderBy: 'completion'
        },
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return workOrder
}
