import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import {
  sanitizeLimit,
  sanitizeOffset,
  sunriseDB
} from '../helpers/database.helpers.js'
import {
  getBurialSiteNameWhereClause,
  getDeceasedNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { WorkOrder } from '../types/record.types.js'

import getBurialSites from './getBurialSites.js'
import getContracts from './getContracts.js'
import getWorkOrderComments from './getWorkOrderComments.js'
import getWorkOrderMilestones from './getWorkOrderMilestones.js'

export interface GetWorkOrdersFilters {
  workOrderTypeId?: number | string

  workOrderOpenDateString?: string
  workOrderOpenStatus?: '' | 'closed' | 'open'

  burialSiteName?: string
  contractId?: number | string
  deceasedName?: string
}

export interface GetWorkOrdersOptions {
  limit: number
  offset: number | string

  includeBurialSites?: boolean
  includeComments?: boolean
  includeMilestones?: boolean
}

export async function getWorkOrders(
  filters: GetWorkOrdersFilters,
  options: GetWorkOrdersOptions,
  connectedDatabase?: sqlite.Database
): Promise<{ count: number; workOrders: WorkOrder[] }> {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  database.function('userFn_dateIntegerToString', dateIntegerToString)

  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  const count: number = database
    .prepare(
      `select count(*) as recordCount
        from WorkOrders w
        ${sqlWhereClause}`
    )
    .pluck()
    .get(sqlParameters) as number

  let workOrders: WorkOrder[] = []

  if (count > 0) {
    const sqlLimitClause =
      options.limit === -1
        ? ''
        : ` limit ${sanitizeLimit(options.limit)} offset ${sanitizeOffset(options.offset)}`

    workOrders = database
      .prepare(
        `select w.workOrderId,
          w.workOrderTypeId, t.workOrderType,
          w.workOrderNumber, w.workOrderDescription,
          w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
          w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
          ifnull(m.workOrderMilestoneCount, 0) as workOrderMilestoneCount,
          ifnull(m.workOrderMilestoneCompletionCount, 0) as workOrderMilestoneCompletionCount,
          ifnull(l.workOrderBurialSiteCount, 0) as workOrderBurialSiteCount

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
            select workOrderId, count(burialSiteId) as workOrderBurialSiteCount
            from WorkOrderBurialSites
            where recordDelete_timeMillis is null
            group by workOrderId) l on w.workOrderId = l.workOrderId
            
          ${sqlWhereClause}
          order by w.workOrderOpenDate desc, w.workOrderNumber desc
          ${sqlLimitClause}`
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
    database.close()
  }

  return {
    count,
    workOrders
  }
}

async function addInclusions(
  workOrder: WorkOrder,
  options: GetWorkOrdersOptions,
  database: sqlite.Database
): Promise<WorkOrder> {
  if (options.includeComments ?? false) {
    workOrder.workOrderComments = getWorkOrderComments(
      workOrder.workOrderId,
      database
    )
  }

  if (options.includeBurialSites ?? false) {
    if (workOrder.workOrderBurialSiteCount === 0) {
      workOrder.workOrderBurialSites = []
    } else {
      const workOrderBurialSitesResults = getBurialSites(
        {
          workOrderId: workOrder.workOrderId
        },
        {
          limit: -1,
          offset: 0,

          includeContractCount: false
        },
        database
      )

      workOrder.workOrderBurialSites = workOrderBurialSitesResults.burialSites
    }

    const contracts = await getContracts(
      {
        workOrderId: workOrder.workOrderId
      },
      {
        limit: -1,
        offset: 0,

        includeFees: false,
        includeInterments: true,
        includeTransactions: false
      },
      database
    )

    workOrder.workOrderContracts = contracts.contracts
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

function buildWhereClause(filters: GetWorkOrdersFilters): {
  sqlParameters: unknown[]
  sqlWhereClause: string
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

  const deceasedNameFilters = getDeceasedNameWhereClause(
    filters.deceasedName,
    'o'
  )
  if (deceasedNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += ` and w.workOrderId in (
        select workOrderId from WorkOrderContracts o
        where recordDelete_timeMillis is null
        and o.contractId in (
          select contractId from ContractInterments o where recordDelete_timeMillis is null
          ${deceasedNameFilters.sqlWhereClause}
        ))`
    sqlParameters.push(...deceasedNameFilters.sqlParameters)
  }

  const burialSiteNameFilters = getBurialSiteNameWhereClause(
    filters.burialSiteName,
    '',
    'l'
  )
  if (burialSiteNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += ` and w.workOrderId in (
        select workOrderId from WorkOrderBurialSites
        where recordDelete_timeMillis is null
        and burialSiteId in (
          select burialSiteId from BurialSites l
          where recordDelete_timeMillis is null
          ${burialSiteNameFilters.sqlWhereClause}
        ))`
    sqlParameters.push(...burialSiteNameFilters.sqlParameters)
  }

  if ((filters.contractId ?? '') !== '') {
    sqlWhereClause +=
      ' and w.workOrderId in (select workOrderId from WorkOrderContracts where recordDelete_timeMillis is null and contractId = ?)'
    sqlParameters.push(filters.contractId)
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}

export default getWorkOrders
