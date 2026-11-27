import type { DatabaseSync, SQLInputValue } from 'node:sqlite'

import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  dateToInteger,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { getCachedSettingValue } from '../helpers/cache/settings.cache.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type {
  BurialSite,
  Contract,
  WorkOrderMilestone
} from '../types/record.types.js'

import getContractInterments from './getContractInterments.js'

export type WorkOrderMilestoneFilters = {
  workOrderId?: number | string
  workOrderMilestoneTypeIds?: string
  workOrderTypeIds?: string

  workOrderMilestoneDateFilter?:
    'blank' | 'date' | 'notBlank' | 'recent' | 'upcomingMissed' | 'yearMonth'

  workOrderMilestoneDateString?: '' | DateString

  workOrderMilestoneYear?: number | string

  workOrderMilestoneMonth?: number | string
}

type WorkOrderMilestoneOptions = {
  includeWorkOrders?: boolean
  orderBy: 'completion' | 'date'
}

const commaSeparatedNumbersRegex = /^\d+(?:,\d+)*$/

export default async function getWorkOrderMilestones(
  filters: WorkOrderMilestoneFilters,
  options: WorkOrderMilestoneOptions,
  connectedDatabase?: DatabaseSync
): Promise<WorkOrderMilestone[]> {
  const database = connectedDatabase ?? getDatabaseConnection()

  database.function(
    'userFn_dateIntegerToString',
    {
      deterministic: true
    },
    (dateInteger: unknown) => dateIntegerToString(dateInteger as number)
  )

  database.function(
    'userFn_timeIntegerToString',
    {
      deterministic: true
    },
    (timeInteger: unknown) => timeIntegerToString(timeInteger as number)
  )

  database.function(
    'userFn_timeIntegerToPeriodString',
    {
      deterministic: true
    },
    (timeInteger: unknown) => timeIntegerToPeriodString(timeInteger as number)
  )

  // Filters
  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  // Order By
  let orderByClause = ''

  switch (options.orderBy) {
    case 'completion': {
      orderByClause = /* sql */ `
        ORDER BY
          m.workOrderMilestoneCompletionDate,
          m.workOrderMilestoneCompletionTime,
          m.workOrderMilestoneDate,
          IFNULL(m.workOrderMilestoneTime, 9999),
          t.orderNumber,
          m.workOrderMilestoneId
      `
      break
    }

    case 'date': {
      orderByClause = /* sql */ `
        ORDER BY
          m.workOrderMilestoneDate,
          IFNULL(m.workOrderMilestoneTime, 9999),
          t.orderNumber,
          m.workOrderId,
          m.workOrderMilestoneId
      `
      break
    }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    // no default
  }

  // Query
  const sql = /* sql */ `
    SELECT
      m.workOrderMilestoneId,
      m.workOrderMilestoneTypeId,
      t.workOrderMilestoneType,
      m.workOrderMilestoneDate,
      userFn_dateIntegerToString (m.workOrderMilestoneDate) AS workOrderMilestoneDateString,
      m.workOrderMilestoneTime,
      userFn_timeIntegerToString (m.workOrderMilestoneTime) AS workOrderMilestoneTimeString,
      userFn_timeIntegerToPeriodString (IFNULL(m.workOrderMilestoneTime, 0)) AS workOrderMilestoneTimePeriodString,
      m.workOrderMilestoneDescription,
      m.workOrderMilestoneCompletionDate,
      userFn_dateIntegerToString (m.workOrderMilestoneCompletionDate) AS workOrderMilestoneCompletionDateString,
      m.workOrderMilestoneCompletionTime,
      userFn_timeIntegerToString (m.workOrderMilestoneCompletionTime) AS workOrderMilestoneCompletionTimeString,
      userFn_timeIntegerToPeriodString (IFNULL(m.workOrderMilestoneCompletionTime, 0)) AS workOrderMilestoneCompletionTimePeriodString,
      ${
        (options.includeWorkOrders ?? false)
          ? ` m.workOrderId, w.workOrderNumber, wt.workOrderType, w.workOrderDescription,
            w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
            w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
            w.recordUpdate_timeMillis as workOrderRecordUpdate_timeMillis,`
          : ''
      } m.recordCreate_username,
      m.recordCreate_timeMillis,
      m.recordUpdate_username,
      m.recordUpdate_timeMillis
    FROM
      WorkOrderMilestones m
      LEFT JOIN WorkOrderMilestoneTypes t ON m.workOrderMilestoneTypeId = t.workOrderMilestoneTypeId
      LEFT JOIN WorkOrders w ON m.workOrderId = w.workOrderId
      LEFT JOIN WorkOrderTypes wt ON w.workOrderTypeId = wt.workOrderTypeId
      ${sqlWhereClause}
      ${orderByClause}
  `

  const workOrderMilestones = database
    .prepare(sql)
    .all(...sqlParameters) as unknown as WorkOrderMilestone[]

  if (options.includeWorkOrders ?? false) {
    addIncludedWorkOrderDetails(workOrderMilestones, database)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return workOrderMilestones
}

function addIncludedWorkOrderDetails(
  workOrderMilestones: WorkOrderMilestone[],
  database: DatabaseSync
): void {
  if (workOrderMilestones.length === 0) {
    return
  }

  const workOrderIds = [
    ...new Set(
      workOrderMilestones
        .map((milestone) => milestone.workOrderId)
        .filter((workOrderId) => workOrderId !== undefined)
    )
  ]

  if (workOrderIds.length === 0) {
    return
  }

  const placeholders = workOrderIds.map(() => '?').join(', ')

  const burialSites = database
    .prepare(
      /* sql */ `
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
      `
    )
    .all(...workOrderIds) as unknown as Array<
    Pick<
      BurialSite,
      'burialSiteId' | 'burialSiteName' | 'cemeteryId' | 'cemeteryName'
    > & { workOrderId: number }
  >

  const contracts = database
    .prepare(
      /* sql */ `
        SELECT
          wc.workOrderId,
          c.contractId,
          c.contractNumber,
          c.contractTypeId,
          ct.contractType,
          c.burialSiteId,
          b.burialSiteName,
          cem.cemeteryName,
          c.contractStartDate,
          c.contractEndDate,
          c.purchaserName,
          c.funeralHomeId,
          c.funeralDirectorName,
          c.funeralDate,
          c.funeralTime,
          c.directionOfArrival,
          c.committalTypeId,
          cm.committalType,
          f.funeralHomeName
        FROM
          WorkOrderContracts wc
          INNER JOIN Contracts c ON wc.contractId = c.contractId
          LEFT JOIN ContractTypes ct ON c.contractTypeId = ct.contractTypeId
          LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          LEFT JOIN CommittalTypes cm ON c.committalTypeId = cm.committalTypeId
          LEFT JOIN FuneralHomes f ON c.funeralHomeId = f.funeralHomeId
        WHERE
          wc.workOrderId IN (${placeholders})
          AND wc.recordDelete_timeMillis IS NULL
          AND c.recordDelete_timeMillis IS NULL
        ORDER BY
          c.contractStartDate DESC,
          c.contractId DESC
      `
    )
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

  for (const workOrderMilestone of workOrderMilestones) {
    workOrderMilestone.workOrderBurialSites = burialSites
      .filter(
        (burialSite) =>
          burialSite.workOrderId === workOrderMilestone.workOrderId
      )
      .map(
        ({ workOrderId: _workOrderId, ...burialSite }) =>
          burialSite as unknown as BurialSite
      )

    workOrderMilestone.workOrderContracts = contracts
      .filter(
        (contract) => contract.workOrderId === workOrderMilestone.workOrderId
      )
      .map(({ workOrderId: _workOrderId, ...contract }) => {
        contract.contractStartDateString = dateIntegerToString(
          contract.contractStartDate
        )
        contract.contractEndDateString = dateIntegerToString(
          contract.contractEndDate ?? 0
        )
        contract.funeralDateString = dateIntegerToString(
          contract.funeralDate ?? 0
        )
        contract.funeralTimeString = timeIntegerToString(
          contract.funeralTime
        )
        contract.funeralTimePeriodString = timeIntegerToPeriodString(
          contract.funeralTime as number
        )
        contract.contractInterments = interments.filter(
          (interment) => interment.contractId === contract.contractId
        )
        return contract
      })
  }
}

function buildWhereClause(filters: WorkOrderMilestoneFilters): {
  sqlParameters: SQLInputValue[]
  sqlWhereClause: string
} {
  const recentBeforeDays = Math.trunc(
    Number(
      getCachedSettingValue('workOrder.workOrderMilestone.recentBeforeDays')
    )
  )

  const recentAfterDays = Math.trunc(
    Number(
      getCachedSettingValue('workOrder.workOrderMilestone.recentAfterDays')
    )
  )

  let sqlWhereClause =
    ' where m.recordDelete_timeMillis IS NULL and w.recordDelete_timeMillis IS NULL'
  const sqlParameters: SQLInputValue[] = []

  if (filters.workOrderId !== undefined && (filters.workOrderId ?? '') !== '') {
    sqlWhereClause += ' and m.workOrderId = ?'
    sqlParameters.push(filters.workOrderId)
  }

  const date = new Date()
  const currentDateNumber = dateToInteger(date)

  date.setDate(date.getDate() - recentBeforeDays)

  const recentBeforeDateNumber = dateToInteger(date)

  date.setDate(date.getDate() + recentBeforeDays + recentAfterDays)

  const recentAfterDateNumber = dateToInteger(date)

  switch (filters.workOrderMilestoneDateFilter) {
    case 'blank': {
      sqlWhereClause += ' and m.workOrderMilestoneDate = 0'
      break
    }

    case 'date':
    case undefined: {
      // 'date' case handled below
      break
    }

    case 'notBlank': {
      sqlWhereClause += ' and m.workOrderMilestoneDate > 0'
      break
    }

    case 'recent': {
      sqlWhereClause +=
        ' and m.workOrderMilestoneDate >= ? and m.workOrderMilestoneDate <= ?'
      sqlParameters.push(recentBeforeDateNumber, recentAfterDateNumber)
      break
    }

    case 'upcomingMissed': {
      sqlWhereClause +=
        ' and (m.workOrderMilestoneCompletionDate IS NULL or m.workOrderMilestoneDate >= ?)'
      sqlParameters.push(currentDateNumber)
      break
    }

    case 'yearMonth': {
      const yearNumber =
        typeof filters.workOrderMilestoneYear === 'string'
          ? Math.trunc(Number(filters.workOrderMilestoneYear))
          : (filters.workOrderMilestoneYear ?? new Date().getFullYear())

      const monthNumber =
        typeof filters.workOrderMilestoneMonth === 'string'
          ? Math.trunc(Number(filters.workOrderMilestoneMonth))
          : (filters.workOrderMilestoneMonth ?? new Date().getMonth() + 1)

      const yearMonth = yearNumber * 10_000 + monthNumber * 100

      sqlWhereClause += ' and m.workOrderMilestoneDate between ? and ?'

      sqlParameters.push(yearMonth, yearMonth + 100)

      break
    }
  }

  if (
    filters.workOrderMilestoneDateString !== undefined &&
    filters.workOrderMilestoneDateString !== ''
  ) {
    sqlWhereClause += ' and m.workOrderMilestoneDate = ?'
    sqlParameters.push(
      dateStringToInteger(filters.workOrderMilestoneDateString)
    )
  }

  if (
    filters.workOrderTypeIds !== undefined &&
    filters.workOrderTypeIds !== '' &&
    commaSeparatedNumbersRegex.test(filters.workOrderTypeIds)
  ) {
    sqlWhereClause += ` and w.workOrderTypeId in (${filters.workOrderTypeIds})`
  }

  if (
    filters.workOrderMilestoneTypeIds !== undefined &&
    filters.workOrderMilestoneTypeIds !== '' &&
    commaSeparatedNumbersRegex.test(filters.workOrderMilestoneTypeIds)
  ) {
    sqlWhereClause += ` and m.workOrderMilestoneTypeId in (${filters.workOrderMilestoneTypeIds})`
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}
