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
  burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith'
  burialSiteName?: string
  cemeteryId?: number | string

  burialSiteStatusId?: number | string
  burialSiteTypeId?: number | string
  contractStatus?: '' | 'occupied' | 'unoccupied'
  workOrderId?: number | string
}

export interface GetBurialSitesOptions {
  /** -1 for no limit */
  limit: number
  offset: number | string

  includeContractCount?: boolean
}

export default function getBurialSites(
  filters: GetBurialSitesFilters,
  options: GetBurialSitesOptions,
  connectedDatabase?: sqlite.Database
): { burialSites: BurialSite[]; count: number } {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  const currentDate = dateToInteger(new Date())

  let count = 0

  if (options.limit !== -1) {
    count = database
      .prepare(
        `select count(*) as recordCount
          from BurialSites l
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          left join (
            select burialSiteId, count(contractId) as contractCount from Contracts
            where recordDelete_timeMillis is null
            and contractStartDate <= ${currentDate.toString()}
            and (contractEndDate is null or contractEndDate >= ${currentDate.toString()})
            group by burialSiteId
          ) o on l.burialSiteId = o.burialSiteId
          ${sqlWhereClause}`
      )
      .pluck()
      .get(sqlParameters) as number
  }

  let burialSites: BurialSite[] = []

  if (options.limit === -1 || count > 0) {
    const includeContractCount = options.includeContractCount ?? true

    if (includeContractCount) {
      sqlParameters.unshift(currentDate, currentDate)
    }

    burialSites = database
      .prepare(
        `select l.burialSiteId,
          l.burialSiteNameSegment1,
          l.burialSiteNameSegment2,
          l.burialSiteNameSegment3,
          l.burialSiteNameSegment4,
          l.burialSiteNameSegment5,
          l.burialSiteName,
          t.burialSiteType,
          l.bodyCapacity, l.crematedCapacity,
          l.cemeteryId, m.cemeteryName, l.cemeterySvgId,
          l.burialSiteStatusId, s.burialSiteStatus
          ${
            includeContractCount
              ? ', ifnull(o.contractCount, 0) as contractCount'
              : ''
          }
          from BurialSites l
          left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          ${
            includeContractCount
              ? `left join (
                  select burialSiteId, count(contractId) as contractCount
                  from Contracts
                  where recordDelete_timeMillis is null
                  and contractStartDate <= ?
                  and (contractEndDate is null or contractEndDate >= ?)
                  group by burialSiteId) o on l.burialSiteId = o.burialSiteId`
              : ''
          }
          ${sqlWhereClause}
          order by l.burialSiteName,
            l.burialSiteId
          ${
            options.limit === -1
              ? ''
              : ` limit ${sanitizeLimit(options.limit)}
                  offset ${sanitizeOffset(options.offset)}`
          }`
      )
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

function buildWhereClause(filters: GetBurialSitesFilters): {
  sqlParameters: unknown[]
  sqlWhereClause: string
} {
  let sqlWhereClause = ' where l.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  const burialSiteNameFilters = getBurialSiteNameWhereClause(
    filters.burialSiteName,
    filters.burialSiteNameSearchType ?? '',
    'l'
  )
  sqlWhereClause += burialSiteNameFilters.sqlWhereClause
  sqlParameters.push(...burialSiteNameFilters.sqlParameters)

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and (m.cemeteryId = ? or m.parentCemeteryId = ?)'
    sqlParameters.push(filters.cemeteryId, filters.cemeteryId)
  }

  if ((filters.burialSiteTypeId ?? '') !== '') {
    sqlWhereClause += ' and l.burialSiteTypeId = ?'
    sqlParameters.push(filters.burialSiteTypeId)
  }

  if ((filters.burialSiteStatusId ?? '') !== '') {
    sqlWhereClause += ' and l.burialSiteStatusId = ?'
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
      ' and l.burialSiteId in (select burialSiteId from WorkOrderBurialSites where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}
