import { acquireConnection } from './pool.js'
import type { PoolConnection } from 'better-sqlite-pool'

import { dateIntegerToString } from '@cityssm/utils-datetime'

import { getLots } from './getLots.js'

import { getLotOccupancies } from './getLotOccupancies.js'

import { getWorkOrderComments } from './getWorkOrderComments.js'

import { getWorkOrderMilestones } from './getWorkOrderMilestones.js'

import type * as recordTypes from '../../types/recordTypes'

interface WorkOrderOptions {
  includeLotsAndLotOccupancies: boolean
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

async function _getWorkOrder(
  sql: string,
  workOrderIdOrWorkOrderNumber: number | string,
  options: WorkOrderOptions,
  connectedDatabase?: PoolConnection
): Promise<recordTypes.WorkOrder | undefined> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)

  const workOrder: recordTypes.WorkOrder = database
    .prepare(sql)
    .get(workOrderIdOrWorkOrderNumber)

  if (workOrder !== undefined) {
    if (options.includeLotsAndLotOccupancies) {
      const workOrderLotsResults = await getLots(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          limit: -1,
          offset: 0,
          includeLotOccupancyCount: false
        },
        database
      )

      workOrder.workOrderLots = workOrderLotsResults.lots

      const workOrderLotOccupanciesResults = await getLotOccupancies(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          limit: -1,
          offset: 0,
          includeOccupants: true,
          includeFees: false,
          includeTransactions: false
        },
        database
      )

      workOrder.workOrderLotOccupancies =
        workOrderLotOccupanciesResults.lotOccupancies
    }

    if (options.includeComments) {
      workOrder.workOrderComments = await getWorkOrderComments(
        workOrder.workOrderId as number,
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

export async function getWorkOrderByWorkOrderNumber(
  workOrderNumber: string
): Promise<recordTypes.WorkOrder | undefined> {
  return await _getWorkOrder(
    baseSQL + ' and w.workOrderNumber = ?',
    workOrderNumber,
    {
      includeLotsAndLotOccupancies: true,
      includeComments: true,
      includeMilestones: true
    }
  )
}

export async function getWorkOrder(
  workOrderId: number | string,
  options: WorkOrderOptions,
  connectedDatabase?: PoolConnection
): Promise<recordTypes.WorkOrder | undefined> {
  return await _getWorkOrder(
    baseSQL + ' and w.workOrderId = ?',
    workOrderId,
    options,
    connectedDatabase
  )
}

export default getWorkOrder
