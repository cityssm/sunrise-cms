import { dateToInteger } from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { getLotNameWhereClause } from '../helpers/functions.sqlFilters.js'
import type { Lot } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

interface GetLotsFilters {
  lotNameSearchType?: '' | 'startsWith' | 'endsWith'
  lotName?: string
  mapId?: number | string
  lotTypeId?: number | string
  lotStatusId?: number | string
  occupancyStatus?: '' | 'occupied' | 'unoccupied'
  workOrderId?: number | string
}

interface GetLotsOptions {
  limit: -1 | number
  offset: number
  includeLotOccupancyCount?: boolean
}

function buildWhereClause(filters: GetLotsFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ' where l.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  const lotNameFilters = getLotNameWhereClause(
    filters.lotName,
    filters.lotNameSearchType ?? '',
    'l'
  )
  sqlWhereClause += lotNameFilters.sqlWhereClause
  sqlParameters.push(...lotNameFilters.sqlParameters)

  if ((filters.mapId ?? '') !== '') {
    sqlWhereClause += ' and l.mapId = ?'
    sqlParameters.push(filters.mapId)
  }

  if ((filters.lotTypeId ?? '') !== '') {
    sqlWhereClause += ' and l.lotTypeId = ?'
    sqlParameters.push(filters.lotTypeId)
  }

  if ((filters.lotStatusId ?? '') !== '') {
    sqlWhereClause += ' and l.lotStatusId = ?'
    sqlParameters.push(filters.lotStatusId)
  }

  if ((filters.occupancyStatus ?? '') !== '') {
    if (filters.occupancyStatus === 'occupied') {
      sqlWhereClause += ' and lotOccupancyCount > 0'
    } else if (filters.occupancyStatus === 'unoccupied') {
      sqlWhereClause +=
        ' and (lotOccupancyCount is null or lotOccupancyCount = 0)'
    }
  }

  if ((filters.workOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and l.lotId in (select lotId from WorkOrderLots where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

export default async function getLots(
  filters: GetLotsFilters,
  options: GetLotsOptions,
  connectedDatabase?: PoolConnection
): Promise<{ count: number; lots: Lot[] }> {
  const database = connectedDatabase ?? (await acquireConnection())

  const { sqlWhereClause, sqlParameters } = buildWhereClause(filters)

  const currentDate = dateToInteger(new Date())

  let count = 0

  if (options.limit !== -1) {
    count = (
      database
        .prepare(
          `select count(*) as recordCount
            from Lots l
            left join (
              select lotId, count(lotOccupancyId) as lotOccupancyCount from LotOccupancies
              where recordDelete_timeMillis is null
              and occupancyStartDate <= ${currentDate.toString()}
              and (occupancyEndDate is null or occupancyEndDate >= ${currentDate.toString()})
              group by lotId
            ) o on l.lotId = o.lotId
            ${sqlWhereClause}`
        )
        .get(sqlParameters) as { recordCount: number }
    ).recordCount
  }

  let lots: Lot[] = []

  if (options.limit === -1 || count > 0) {
    const includeLotOccupancyCount = options.includeLotOccupancyCount ?? true

    database.function(
      'userFn_lotNameSortName',
      getConfigProperty('settings.lot.lotNameSortNameFunction')
    )

    if (includeLotOccupancyCount) {
      sqlParameters.unshift(currentDate, currentDate)
    }

    lots = database
      .prepare(
        `select l.lotId, l.lotName,
          t.lotType,
          l.mapId, m.mapName, l.mapKey,
          l.lotStatusId, s.lotStatus
          ${
            includeLotOccupancyCount
              ? ', ifnull(o.lotOccupancyCount, 0) as lotOccupancyCount'
              : ''
          }
          from Lots l
          left join LotTypes t on l.lotTypeId = t.lotTypeId
          left join LotStatuses s on l.lotStatusId = s.lotStatusId
          left join Maps m on l.mapId = m.mapId
          ${
            includeLotOccupancyCount
              ? `left join (
                  select lotId, count(lotOccupancyId) as lotOccupancyCount
                  from LotOccupancies
                  where recordDelete_timeMillis is null
                  and occupancyStartDate <= ?
                  and (occupancyEndDate is null or occupancyEndDate >= ?)
                  group by lotId) o on l.lotId = o.lotId`
              : ''
          }
          ${sqlWhereClause}
          order by userFn_lotNameSortName(l.lotName), l.lotId
          ${
            options.limit === -1
              ? ''
              : ` limit ${options.limit.toString()} offset ${options.offset.toString()}`
          }`
      )
      .all(sqlParameters) as Lot[]

    if (options.limit === -1) {
      count = lots.length
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return {
    count,
    lots
  }
}
