import { dateToInteger } from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import { getBurialSiteNameWhereClause } from '../helpers/functions.sqlFilters.js'
import type { BurialSite } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export interface GetBurialSitesFilters {
  burialSiteNameSearchType?: '' | 'startsWith' | 'endsWith'
  burialSiteName?: string
  cemeteryId?: number | string
  burialSiteTypeId?: number | string
  burialSiteStatusId?: number | string
  contractStatus?: '' | 'occupied' | 'unoccupied'
  workOrderId?: number | string
}

export interface GetBurialSitesOptions {
  /** -1 for no limit */
  limit: number
  offset: string | number
  includeBurialSiteContractCount?: boolean
}

function buildWhereClause(filters: GetBurialSitesFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
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
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
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
      sqlWhereClause += ' and burialSiteContractCount > 0'
    } else if (filters.contractStatus === 'unoccupied') {
      sqlWhereClause +=
        ' and (burialSiteContractCount is null or burialSiteContractCount = 0)'
    }
  }

  if ((filters.workOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and l.burialSiteId in (select burialSiteId from WorkOrderBurialSites where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

export default async function getBurialSites(
  filters: GetBurialSitesFilters,
  options: GetBurialSitesOptions,
  connectedDatabase?: PoolConnection
): Promise<{ count: number; burialSites: BurialSite[] }> {
  const database = connectedDatabase ?? (await acquireConnection())

  const { sqlWhereClause, sqlParameters } = buildWhereClause(filters)

  const currentDate = dateToInteger(new Date())

  let count = 0

  if (options.limit !== -1) {
    count = (
      database
        .prepare(
          `select count(*) as recordCount
            from BurialSites l
            left join (
              select burialSiteId, count(burialSiteContractId) as burialSiteContractCount from BurialSiteContracts
              where recordDelete_timeMillis is null
              and contractStartDate <= ${currentDate.toString()}
              and (contractEndDate is null or contractEndDate >= ${currentDate.toString()})
              group by burialSiteId
            ) o on l.burialSiteId = o.burialSiteId
            ${sqlWhereClause}`
        )
        .get(sqlParameters) as { recordCount: number }
    ).recordCount
  }

  let burialSites: BurialSite[] = []

  if (options.limit === -1 || count > 0) {
    const includeBurialSiteContractCount = options.includeBurialSiteContractCount ?? true

    if (includeBurialSiteContractCount) {
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
          t.burialSiteType,
          l.cemeteryId, m.cemeteryName, l.cemeterySvgId,
          l.burialSiteStatusId, s.burialSiteStatus
          ${
            includeBurialSiteContractCount
              ? ', ifnull(o.burialSiteContractCount, 0) as burialSiteContractCount'
              : ''
          }
          from BurialSites l
          left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          ${
            includeBurialSiteContractCount
              ? `left join (
                  select burialSiteId, count(burialSiteContractId) as burialSiteContractCount
                  from BurialSiteContracts
                  where recordDelete_timeMillis is null
                  and contractStartDate <= ?
                  and (contractEndDate is null or contractEndDate >= ?)
                  group by burialSiteId) o on l.burialSiteId = o.burialSiteId`
              : ''
          }
          ${sqlWhereClause}
          order by l.burialSiteNameSegment1,
            l.burialSiteNameSegment2,
            l.burialSiteNameSegment3,
            l.burialSiteNameSegment4,
            l.burialSiteNameSegment5,
            l.burialSiteId
          ${
            options.limit === -1
              ? ''
              : ` limit ${options.limit.toString()} offset ${options.offset.toString()}`
          }`
      )
      .all(sqlParameters) as BurialSite[]

    if (options.limit === -1) {
      count = burialSites.length
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return {
    count,
    burialSites
  }
}
