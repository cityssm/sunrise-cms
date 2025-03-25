import type { PoolConnection } from 'better-sqlite-pool'

import { dateIntegerToString } from '@cityssm/utils-datetime'

import type { WorkOrder } from '../types/recordTypes.js'

import getBurialSites from './getBurialSites.js'
import getContracts from './getContracts.js'
import getWorkOrderComments from './getWorkOrderComments.js'
import getWorkOrderMilestones from './getWorkOrderMilestones.js'
import { acquireConnection } from './pool.js'

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
  connectedDatabase?: PoolConnection
): Promise<undefined | WorkOrder> {
  return await _getWorkOrder(
    `${baseSQL} and w.workOrderId = ?`,
    workOrderId,
    options,
    connectedDatabase
  )
}

export async function getWorkOrderByWorkOrderNumber(
  workOrderNumber: string
): Promise<undefined | WorkOrder> {
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
  connectedDatabase?: PoolConnection
): Promise<undefined | WorkOrder> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)

  const workOrder = database.prepare(sql).get(workOrderIdOrWorkOrderNumber) as
    | undefined
    | WorkOrder

  if (workOrder !== undefined) {
    if (options.includeBurialSites) {
      const burialSiteResults = await getBurialSites(
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
    database.release()
  }

  return workOrder
}
