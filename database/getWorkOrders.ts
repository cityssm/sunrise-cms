import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import {
  getBurialSiteNameWhereClause,
  getOccupantNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { WorkOrder } from '../types/recordTypes.js'

import getBurialSiteContracts from './getBurialSiteContracts.js'
import getBurialSites from './getBurialSites.js'
import getWorkOrderComments from './getWorkOrderComments.js'
import getWorkOrderMilestones from './getWorkOrderMilestones.js'
import { acquireConnection } from './pool.js'

export interface GetWorkOrdersFilters {
  workOrderTypeId?: number | string
  workOrderOpenStatus?: '' | 'open' | 'closed'
  workOrderOpenDateString?: string
  occupantName?: string
  lotName?: string
  burialSiteContractId?: number | string
}

interface GetWorkOrdersOptions {
  limit: number
  offset: number
  includeBurialSites?: boolean
  includeComments?: boolean
  includeMilestones?: boolean
}

function buildWhereClause(filters: GetWorkOrdersFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ' where w.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.workOrderTypeId ?? '') !== '') {
    sqlWhereClause += ' and w.workOrderTypeId = ?'
    sqlParameters.push(filters.workOrderTypeId)
  }

  if ((filters.workOrderOpenStatus ?? '') !== '') {
    if (filters.workOrderOpenStatus === 'open') {
      sqlWhereClause += ' and w.workOrderCloseDate is null'
    } else if (filters.workOrderOpenStatus === 'closed') {
      sqlWhereClause += ' and w.workOrderCloseDate is not null'
    }
  }

  if ((filters.workOrderOpenDateString ?? '') !== '') {
    sqlWhereClause += ' and w.workOrderOpenDate = ?'
    sqlParameters.push(
      dateStringToInteger(filters.workOrderOpenDateString as DateString)
    )
  }

  const occupantNameFilters = getOccupantNameWhereClause(
    filters.occupantName,
    'o'
  )
  if (occupantNameFilters.sqlParameters.length > 0) {
    sqlWhereClause +=
      ` and w.workOrderId in (
        select workOrderId from WorkOrderBurialSiteContracts o
        where recordDelete_timeMillis is null
        and o.burialSiteContractId in (
          select burialSiteContractId from LotOccupancyOccupants o where recordDelete_timeMillis is null
          ${occupantNameFilters.sqlWhereClause}
        ))`
    sqlParameters.push(...occupantNameFilters.sqlParameters)
  }

  const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.lotName, '', 'l')
  if (burialSiteNameFilters.sqlParameters.length > 0) {
    sqlWhereClause +=
      ` and w.workOrderId in (
        select workOrderId from WorkOrderBurialSites
        where recordDelete_timeMillis is null
        and burialSiteId in (
          select burialSiteId from BurialSites l
          where recordDelete_timeMillis is null
          ${burialSiteNameFilters.sqlWhereClause}
        ))`
    sqlParameters.push(...burialSiteNameFilters.sqlParameters)
  }

  if ((filters.burialSiteContractId ?? '') !== '') {
    sqlWhereClause +=
      ' and w.workOrderId in (select workOrderId from WorkOrderBurialSiteContracts where recordDelete_timeMillis is null and burialSiteContractId = ?)'
    sqlParameters.push(filters.burialSiteContractId)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

async function addInclusions(
  workOrder: WorkOrder,
  options: GetWorkOrdersOptions,
  database: PoolConnection
): Promise<WorkOrder> {
  if (options.includeComments ?? false) {
    workOrder.workOrderComments = await getWorkOrderComments(
      workOrder.workOrderId,
      database
    )
  }

  if (options.includeBurialSites ?? false) {
    if (workOrder.workOrderBurialSiteCount === 0) {
      workOrder.workOrderBurialSites = []
    } else {
      const workOrderBurialSitesResults = await getBurialSites(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          limit: -1,
          offset: 0,
          includeBurialSiteContractCount: false
        },
        database
      )

      workOrder.workOrderBurialSites = workOrderBurialSitesResults.burialSites
    }

    const burialSiteContracts = await getBurialSiteContracts(
      {
        workOrderId: workOrder.workOrderId
      },
      {
        limit: -1,
        offset: 0,
        includeInterments: true,
        includeFees: false,
        includeTransactions: false
      },
      database
    )

    workOrder.workOrderBurialSiteContracts = burialSiteContracts.burialSiteContracts
  }

  if (options.includeMilestones ?? false) {
    workOrder.workOrderMilestones =
      workOrder.workOrderMilestoneCount === 0
        ? []
        : await getWorkOrderMilestones(
            {
              workOrderId: workOrder.workOrderId
            },
            {
              orderBy: 'date'
            },
            database
          )
  }

  return workOrder
}

export async function getWorkOrders(
  filters: GetWorkOrdersFilters,
  options: GetWorkOrdersOptions,
  connectedDatabase?: PoolConnection
): Promise<{ count: number; workOrders: WorkOrder[] }> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)

  const { sqlWhereClause, sqlParameters } = buildWhereClause(filters)

  const count: number = (
    database
      .prepare(
        `select count(*) as recordCount
        from WorkOrders w
        ${sqlWhereClause}`
      )
      .get(sqlParameters) as { recordCount: number }
  ).recordCount

  let workOrders: WorkOrder[] = []

  if (count > 0) {
    workOrders = database
      .prepare(
        `select w.workOrderId,
          w.workOrderTypeId, t.workOrderType,
          w.workOrderNumber, w.workOrderDescription,
          w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
          w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
          ifnull(m.workOrderMilestoneCount, 0) as workOrderMilestoneCount,
          ifnull(m.workOrderMilestoneCompletionCount, 0) as workOrderMilestoneCompletionCount,
          ifnull(l.workOrderLotCount, 0) as workOrderLotCount
          from WorkOrders w
          left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId
          left join (
            select workOrderId,
            count(workOrderMilestoneId) as workOrderMilestoneCount,
            sum(case when workOrderMilestoneCompletionDate is null then 0 else 1 end) as workOrderMilestoneCompletionCount
            from WorkOrderMilestones
            where recordDelete_timeMillis is null
            group by workOrderId) m on w.workOrderId = m.workOrderId
          left join (
            select workOrderId, count(lotId) as workOrderLotCount
            from WorkOrderLots
            where recordDelete_timeMillis is null
            group by workOrderId) l on w.workOrderId = l.workOrderId
          ${sqlWhereClause}
          order by w.workOrderOpenDate desc, w.workOrderNumber desc
          ${
            options.limit === -1
              ? ''
              : ` limit ${options.limit} offset ${options.offset}`
          }`
      )
      .all(sqlParameters) as WorkOrder[]
  }

  const hasInclusions =
    (options.includeComments ?? false) ||
    (options.includeBurialSites ?? false) ||
    (options.includeMilestones ?? false)

  if (hasInclusions) {
    for (const workOrder of workOrders) {
      await addInclusions(workOrder, options, database)
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return {
    count,
    workOrders
  }
}

export default getWorkOrders
