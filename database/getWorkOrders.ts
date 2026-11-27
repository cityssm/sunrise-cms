/* eslint-disable max-lines */
import type { DatabaseSync, SQLInputValue, SQLOutputValue } from 'node:sqlite'

import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  dateToInteger
} from '@cityssm/utils-datetime'

import {
  getDatabaseConnection,
  sanitizeLimit,
  sanitizeOffset
} from '../helpers/database.helpers.js'
import {
  getBurialSiteNameWhereClause,
  getDeceasedNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { BurialSite, Contract, WorkOrder } from '../types/record.types.js'

import getContractInterments from './getContractInterments.js'
import getWorkOrderComments from './getWorkOrderComments.js'
import getWorkOrderMilestones from './getWorkOrderMilestones.js'

export type GetWorkOrdersFilters = {
  workOrderStatusId?: number | string
  workOrderTypeId?: number | string

  workOrderOpenDateString?: string
  workOrderOpenStatus?: '' | 'closed' | 'open'

  burialSiteName?: string
  cemeteryId?: number | string

  contractId?: number | string
  deceasedName?: string
  funeralHomeId?: number | string

  workOrderMilestoneDateString?: DateString
}

export type GetWorkOrdersOptions = {
  /**
   * -1 = no limit
   */
  limit: number
  offset: number | string

  includeBurialSites?: boolean
  includeComments?: boolean
  includeMilestones?: boolean
}

export default async function getWorkOrders(
  filters: GetWorkOrdersFilters,
  options: GetWorkOrdersOptions,
  connectedDatabase?: DatabaseSync
): Promise<{ count: number; workOrders: WorkOrder[] }> {
  const database = connectedDatabase ?? getDatabaseConnection(true)

  database.function(
    'userFn_dateIntegerToString',
    {
      deterministic: true
    },
    (dateInteger: SQLOutputValue) => dateIntegerToString(dateInteger as number)
  )

  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  const countResult: { recordCount: number } = database
    .prepare(/* sql */ `
      SELECT
        COUNT(*) AS recordCount
      FROM
        WorkOrders w
        ${sqlWhereClause}
    `)
    .get(...sqlParameters) as { recordCount: number }

  const count: number = countResult.recordCount

  let workOrders: WorkOrder[] = []

  if (count > 0) {
    const sqlLimitClause =
      options.limit === -1
        ? ''
        : /* sql */ `
            LIMIT
              ${sanitizeLimit(options.limit)}
            OFFSET
              ${sanitizeOffset(options.offset)}
          `

    const currentDateNumber = dateToInteger(new Date())

    workOrders = database
      // eslint-disable-next-line sqlite-security/no-unsafe-query
      .prepare(/* sql */ `
        SELECT
          w.workOrderId,
          w.workOrderTypeId,
          t.workOrderType,
          w.workOrderNumber,
          w.workOrderDescription,
          w.workOrderOpenDate,
          userFn_dateIntegerToString (w.workOrderOpenDate) AS workOrderOpenDateString,
          w.workOrderCloseDate,
          userFn_dateIntegerToString (w.workOrderCloseDate) AS workOrderCloseDateString,
          w.workOrderStatusId,
          s.workOrderStatus,
          IFNULL(m.workOrderMilestoneCount, 0) AS workOrderMilestoneCount,
          IFNULL(m.workOrderMilestoneCompletionCount, 0) AS workOrderMilestoneCompletionCount,
          IFNULL(m.workOrderMilestoneOverdueCount, 0) AS workOrderMilestoneOverdueCount,
          IFNULL(l.workOrderBurialSiteCount, 0) AS workOrderBurialSiteCount
        FROM
          WorkOrders w
          LEFT JOIN WorkOrderTypes t ON w.workOrderTypeId = t.workOrderTypeId
          LEFT JOIN WorkOrderStatuses s ON w.workOrderStatusId = s.workOrderStatusId
          LEFT JOIN (
            SELECT
              workOrderId,
              COUNT(workOrderMilestoneId) AS workOrderMilestoneCount,
              SUM(
                CASE
                  WHEN workOrderMilestoneCompletionDate IS NULL THEN 0
                  ELSE 1
                END
              ) AS workOrderMilestoneCompletionCount,
              SUM(
                CASE
                  WHEN workOrderMilestoneDate < ${currentDateNumber}
                  AND workOrderMilestoneCompletionDate IS NULL THEN 1
                  ELSE 0
                END
              ) AS workOrderMilestoneOverdueCount
            FROM
              WorkOrderMilestones
            WHERE
              recordDelete_timeMillis IS NULL
            GROUP BY
              workOrderId
          ) m ON w.workOrderId = m.workOrderId
          LEFT JOIN (
            SELECT
              workOrderId,
              COUNT(burialSiteId) AS workOrderBurialSiteCount
            FROM
              WorkOrderBurialSites
            WHERE
              recordDelete_timeMillis IS NULL
            GROUP BY
              workOrderId
          ) l ON w.workOrderId = l.workOrderId
          ${sqlWhereClause}
        ORDER BY
          w.workOrderOpenDate DESC,
          w.workOrderNumber DESC
          ${sqlLimitClause}
      `)
      .all(...sqlParameters) as unknown as WorkOrder[]
  }

  const hasInclusions =
    (options.includeComments ?? false) ||
    (options.includeBurialSites ?? false) ||
    (options.includeMilestones ?? false)

  if (hasInclusions) {
    await addInclusions(workOrders, options, database)
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
  workOrders: WorkOrder[],
  options: GetWorkOrdersOptions,
  database: DatabaseSync
): Promise<void> {
  if (workOrders.length === 0) {
    return
  }

  const workOrderIds = workOrders.map((workOrder) => workOrder.workOrderId)

  for (const workOrder of workOrders) {
    if (options.includeComments ?? false) {
      workOrder.workOrderComments = getWorkOrderComments(
        workOrder.workOrderId,
        database
      )
    }
  }

  if (options.includeMilestones ?? false) {
    await Promise.all(
      workOrders.map(async (workOrder) => {
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
      })
    )
  }

  // eslint-disable-next-line unicorn/prefer-early-return
  if (options.includeBurialSites ?? false) {
    const placeholders = workOrderIds.map(() => '?').join(', ')

    const burialSites = database
      .prepare(/* sql */ `
        SELECT
          wbs.workOrderId,
          b.burialSiteId,
          b.burialSiteName,
          b.cemeteryId,
          cem.cemeteryName
        FROM
          WorkOrderBurialSites wbs
          INNER JOIN BurialSites b ON wbs.burialSiteId = b.burialSiteId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
        WHERE
          wbs.workOrderId IN (${placeholders})
          AND wbs.recordDelete_timeMillis IS NULL
          AND b.recordDelete_timeMillis IS NULL
        ORDER BY
          b.burialSiteName,
          b.burialSiteId
      `)
      .all(...workOrderIds) as unknown as Array<
      Pick<
        BurialSite,
        'burialSiteId' | 'burialSiteName' | 'cemeteryId' | 'cemeteryName'
      > & { workOrderId: number }
    >

    for (const workOrder of workOrders) {
      workOrder.workOrderBurialSites = burialSites
        .filter(
          (burialSite) => burialSite.workOrderId === workOrder.workOrderId
        )
        .map(
          ({ workOrderId: _workOrderId, ...burialSite }) =>
            burialSite as unknown as BurialSite
        )
    }

    const contracts = database
      .prepare(/* sql */ `
        SELECT
          wc.workOrderId,
          c.contractId,
          c.contractNumber,
          c.contractTypeId,
          c.burialSiteId,
          c.purchaserName,
          c.funeralHomeId,
          f.funeralHomeName
        FROM
          WorkOrderContracts wc
          INNER JOIN Contracts c ON wc.contractId = c.contractId
          LEFT JOIN FuneralHomes f ON c.funeralHomeId = f.funeralHomeId
        WHERE
          wc.workOrderId IN (${placeholders})
          AND wc.recordDelete_timeMillis IS NULL
          AND c.recordDelete_timeMillis IS NULL
        ORDER BY
          c.contractStartDate DESC,
          c.contractId DESC
      `)
      .all(...workOrderIds) as unknown as Array<
      Contract & { workOrderId: number }
    >

    const contractIds = [
      ...new Set(contracts.map((contract) => contract.contractId))
    ]
    const interments =
      contractIds.length === 0
        ? []
        : getContractInterments(contractIds, database)

    for (const workOrder of workOrders) {
      workOrder.workOrderContracts = contracts
        .filter((contract) => contract.workOrderId === workOrder.workOrderId)
        .map(({ workOrderId: _workOrderId, ...contract }) => {
          contract.contractInterments = interments.filter(
            (interment) => interment.contractId === contract.contractId
          )
          return contract
        })
    }
  }
}

function buildWhereClause(filters: GetWorkOrdersFilters): {
  sqlParameters: SQLInputValue[]
  sqlWhereClause: string
} {
  let sqlWhereClause = ' where w.recordDelete_timeMillis IS NULL'
  const sqlParameters: SQLInputValue[] = []

  if ((filters.workOrderTypeId ?? '') !== '') {
    sqlWhereClause += ' and w.workOrderTypeId = ?'
    sqlParameters.push(filters.workOrderTypeId ?? '')
  }

  if ((filters.workOrderStatusId ?? '') !== '') {
    sqlWhereClause += ' and w.workOrderStatusId = ?'
    sqlParameters.push(filters.workOrderStatusId ?? '')
  }

  if ((filters.workOrderOpenStatus ?? '') !== '') {
    if (filters.workOrderOpenStatus === 'open') {
      sqlWhereClause += ' and w.workOrderCloseDate IS NULL'
    } else if (filters.workOrderOpenStatus === 'closed') {
      sqlWhereClause += ' and w.workOrderCloseDate IS NOT NULL'
    }
  }

  if ((filters.workOrderOpenDateString ?? '') !== '') {
    sqlWhereClause += ' and w.workOrderOpenDate = ?'
    sqlParameters.push(
      dateStringToInteger(filters.workOrderOpenDateString as DateString)
    )
  }

  if ((filters.workOrderMilestoneDateString ?? '') !== '') {
    sqlWhereClause += /* sql */ `
      AND (
        w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderMilestones
          WHERE
            recordDelete_timeMillis IS NULL
            AND workOrderMilestoneDate = ?
        )
        OR (
          w.workOrderOpenDate = ?
          AND (
            SELECT
              COUNT(*)
            FROM
              WorkOrderMilestones m
            WHERE
              m.recordDelete_timeMillis IS NULL
              AND m.workOrderId = w.workOrderId
          ) = 0
        )
      )
    `

    sqlParameters.push(
      dateStringToInteger(filters.workOrderMilestoneDateString as DateString),
      dateStringToInteger(filters.workOrderMilestoneDateString as DateString)
    )
  }

  /*
   * Funeral Home
   */

  if ((filters.funeralHomeId ?? '') !== '') {
    sqlWhereClause += /* sql */ `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          WorkOrderContracts wc
          LEFT JOIN Contracts c ON wc.contractId = c.contractId
        WHERE
          wc.recordDelete_timeMillis IS NULL
          AND c.funeralHomeId = ?
      )
    `

    sqlParameters.push(filters.funeralHomeId ?? '')
  }

  /*
   * Deceased Name
   */

  const deceasedNameFilters = getDeceasedNameWhereClause(
    filters.deceasedName,
    'ci'
  )
  if (deceasedNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += /* sql */ `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          WorkOrderContracts wc
        WHERE
          wc.recordDelete_timeMillis IS NULL
          AND wc.contractId IN (
            SELECT
              contractId
            FROM
              ContractInterments ci
            WHERE
              ci.recordDelete_timeMillis IS NULL
              ${deceasedNameFilters.sqlWhereClause}
          )
      )
    `
    sqlParameters.push(...deceasedNameFilters.sqlParameters)
  }

  /*
   * Burial Site Name
   */

  const burialSiteNameFilters = getBurialSiteNameWhereClause(
    filters.burialSiteName,
    '',
    'l'
  )
  if (burialSiteNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += /* sql */ `
      AND (
        w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderBurialSites
          WHERE
            recordDelete_timeMillis IS NULL
            AND burialSiteId IN (
              SELECT
                burialSiteId
              FROM
                BurialSites l
              WHERE
                recordDelete_timeMillis IS NULL
                ${burialSiteNameFilters.sqlWhereClause}
            )
        )
        OR w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts wc
            LEFT JOIN Contracts c ON wc.contractId = c.contractId
          WHERE
            wc.recordDelete_timeMillis IS NULL
            AND c.burialSiteId IN (
              SELECT
                burialSiteId
              FROM
                BurialSites l
              WHERE
                l.recordDelete_timeMillis IS NULL
                ${burialSiteNameFilters.sqlWhereClause}
            )
        )
      )
    `

    sqlParameters.push(
      ...burialSiteNameFilters.sqlParameters,
      ...burialSiteNameFilters.sqlParameters
    )
  }

  /*
   * Cemetery
   */

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += /* sql */ `
      AND (
        w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderBurialSites wb
            LEFT JOIN BurialSites b ON wb.burialSiteId = b.burialSiteId
            LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          WHERE
            wb.recordDelete_timeMillis IS NULL
            AND (
              cem.cemeteryId = ?
              OR cem.parentCemeteryId = ?
            )
        )
        OR w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts wc
            LEFT JOIN Contracts c ON wc.contractId = c.contractId
            LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
            LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          WHERE
            wc.recordDelete_timeMillis IS NULL
            AND (
              cem.cemeteryId = ?
              OR cem.parentCemeteryId = ?
            )
        )
      )
    `

    sqlParameters.push(
      filters.cemeteryId ?? '',
      filters.cemeteryId ?? '',
      filters.cemeteryId ?? '',
      filters.cemeteryId ?? ''
    )
  }

  /*
   * Contract
   */

  if (filters.contractId !== undefined && (filters.contractId ?? '') !== '') {
    sqlWhereClause += /* sql */ `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          WorkOrderContracts
        WHERE
          recordDelete_timeMillis IS NULL
          AND contractId = ?
      )
    `
    sqlParameters.push(filters.contractId)
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}
