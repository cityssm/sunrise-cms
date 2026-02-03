import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import {
  sanitizeLimit,
  sanitizeOffset,
  sunriseDB
} from '../helpers/database.helpers.js'
import { getBurialSiteNameWhereClause } from '../helpers/functions.sqlFilters.js'
import type { BurialSite } from '../types/record.types.js'

export interface GetBurialSitesFilters {
  burialSiteName?: string
  burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith'

  cemeteryId?: number | string

  burialSiteStatusId?: number | string
  burialSiteTypeId?: number | string
  contractStatus?: '' | 'occupied' | 'unoccupied'
  workOrderId?: number | string

  hasCoordinates?: '' | 'no' | 'yes'
}

export interface GetBurialSitesOptions {
  /** -1 for no limit */
  limit: number
  offset: number | string

  includeContractCount?: boolean
  includeDeleted?: boolean
}

export default function getBurialSites(
  filters: GetBurialSitesFilters,
  options: GetBurialSitesOptions,
  connectedDatabase?: sqlite.Database
): { burialSites: BurialSite[]; count: number } {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const { sqlParameters, sqlWhereClause } = buildWhereClause(
    filters,
    options.includeDeleted ?? false
  )

  const currentDate = dateToInteger(new Date())

  let count = 0

  const isLimited = options.limit !== -1

  if (isLimited) {
    count = database
      .prepare(/* sql */ `
        SELECT
          count(*) AS recordCount
        FROM
          BurialSites b
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          LEFT JOIN (
            SELECT
              burialSiteId,
              count(contractId) AS contractCount
            FROM
              Contracts
            WHERE
              recordDelete_timeMillis IS NULL
              AND contractStartDate <= ${currentDate.toString()}
              AND (
                contractEndDate IS NULL
                OR contractEndDate >= ${currentDate.toString()}
              )
            GROUP BY
              burialSiteId
          ) c ON b.burialSiteId = c.burialSiteId ${sqlWhereClause}
      `)
      .pluck()
      .get(sqlParameters) as number
  }

  let burialSites: BurialSite[] = []

  if (!isLimited || count > 0) {
    const includeContractCount = options.includeContractCount ?? true

    if (includeContractCount) {
      sqlParameters.unshift(currentDate, currentDate)
    }

    const sqlLimitClause = isLimited
      ? ` limit ${sanitizeLimit(options.limit)}
          offset ${sanitizeOffset(options.offset)}`
      : ''

    burialSites = database
      .prepare(/* sql */ `
        SELECT
          b.burialSiteId,
          b.burialSiteNameSegment1,
          b.burialSiteNameSegment2,
          b.burialSiteNameSegment3,
          b.burialSiteNameSegment4,
          b.burialSiteNameSegment5,
          b.burialSiteName,
          t.burialSiteType,
          b.bodyCapacity,
          b.crematedCapacity,
          b.cemeteryId,
          cem.cemeteryName,
          b.cemeterySvgId,
          b.burialSiteStatusId,
          s.burialSiteStatus,
          b.burialSiteLatitude,
          b.burialSiteLongitude ${includeContractCount
            ? ', ifnull(c.contractCount, 0) as contractCount'
            : ''}
        FROM
          BurialSites b
          LEFT JOIN BurialSiteTypes t ON b.burialSiteTypeId = t.burialSiteTypeId
          LEFT JOIN BurialSiteStatuses s ON b.burialSiteStatusId = s.burialSiteStatusId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId ${includeContractCount
            ? `left join (
                  select burialSiteId, count(contractId) as contractCount
                  from Contracts
                  where recordDelete_timeMillis is null
                  and contractStartDate <= ?
                  and (contractEndDate is null or contractEndDate >= ?)
                  group by burialSiteId) c on b.burialSiteId = c.burialSiteId`
            : ''} ${sqlWhereClause}
        ORDER BY
          b.burialSiteName,
          b.burialSiteId ${sqlLimitClause}
      `)
      .all(sqlParameters) as BurialSite[]

    if (options.limit === -1) {
      count = burialSites.length
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return {
    burialSites,
    count
  }
}

function buildWhereClause(
  filters: GetBurialSitesFilters,
  includeDeleted: boolean
): {
  sqlParameters: unknown[]
  sqlWhereClause: string
} {
  let sqlWhereClause = ` where ${includeDeleted ? ' 1 = 1' : ' b.recordDelete_timeMillis is null'}`
  const sqlParameters: unknown[] = []

  const burialSiteNameFilters = getBurialSiteNameWhereClause(
    filters.burialSiteName,
    filters.burialSiteNameSearchType ?? '',
    'b'
  )
  sqlWhereClause += burialSiteNameFilters.sqlWhereClause
  sqlParameters.push(...burialSiteNameFilters.sqlParameters)

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and (cem.cemeteryId = ? or cem.parentCemeteryId = ?)'
    sqlParameters.push(filters.cemeteryId, filters.cemeteryId)
  }

  if ((filters.burialSiteTypeId ?? '') !== '') {
    sqlWhereClause += ' and b.burialSiteTypeId = ?'
    sqlParameters.push(filters.burialSiteTypeId)
  }

  if ((filters.burialSiteStatusId ?? '') !== '') {
    sqlWhereClause += ' and b.burialSiteStatusId = ?'
    sqlParameters.push(filters.burialSiteStatusId)
  }

  if ((filters.contractStatus ?? '') !== '') {
    if (filters.contractStatus === 'occupied') {
      sqlWhereClause += ' and contractCount > 0'
    } else if (filters.contractStatus === 'unoccupied') {
      sqlWhereClause += ' and (contractCount is null or contractCount = 0)'
    }
  }

  if ((filters.workOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and b.burialSiteId in (select burialSiteId from WorkOrderBurialSites where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  if ((filters.hasCoordinates ?? '') === 'yes') {
    sqlWhereClause +=
      ' and (b.burialSiteLatitude is not null and b.burialSiteLongitude is not null)'
  }

  if ((filters.hasCoordinates ?? '') === 'no') {
    sqlWhereClause +=
      ' and (b.burialSiteLatitude is null or b.burialSiteLongitude is null)'
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}
