import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import { getOccupancyTypeById } from '../helpers/functions.cache.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import {
  getLotNameWhereClause,
  getOccupancyTimeWhereClause,
  getOccupantNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { LotOccupancy } from '../types/recordTypes.js'

import getLotOccupancyFees from './getLotOccupancyFees.js'
import getLotOccupancyOccupants from './getLotOccupancyOccupants.js'
import getLotOccupancyTransactions from './getLotOccupancyTransactions.js'
import { acquireConnection } from './pool.js'

interface GetLotOccupanciesFilters {
  lotId?: number | string
  occupancyTime?: '' | 'past' | 'current' | 'future'
  occupancyStartDateString?: DateString
  occupancyEffectiveDateString?: string
  occupantName?: string
  occupancyTypeId?: number | string
  mapId?: number | string
  lotNameSearchType?: '' | 'startsWith' | 'endsWith'
  lotName?: string
  lotTypeId?: number | string
  workOrderId?: number | string
  notWorkOrderId?: number | string
}

interface GetLotOccupanciesOptions {
  limit: -1 | number
  offset: number
  includeOccupants: boolean
  includeFees: boolean
  includeTransactions: boolean
}

function buildWhereClause(filters: GetLotOccupanciesFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ' where o.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.lotId ?? '') !== '') {
    sqlWhereClause += ' and o.lotId = ?'
    sqlParameters.push(filters.lotId)
  }

  const lotNameFilters = getLotNameWhereClause(
    filters.lotName,
    filters.lotNameSearchType ?? '',
    'l'
  )
  sqlWhereClause += lotNameFilters.sqlWhereClause
  sqlParameters.push(...lotNameFilters.sqlParameters)

  const occupantNameFilters = getOccupantNameWhereClause(
    filters.occupantName,
    'o'
  )
  if (occupantNameFilters.sqlParameters.length > 0) {
    sqlWhereClause +=
      ` and o.lotOccupancyId in (
        select lotOccupancyId from LotOccupancyOccupants o
        where recordDelete_timeMillis is null
        ${occupantNameFilters.sqlWhereClause})`
    sqlParameters.push(...occupantNameFilters.sqlParameters)
  }

  if ((filters.occupancyTypeId ?? '') !== '') {
    sqlWhereClause += ' and o.occupancyTypeId = ?'
    sqlParameters.push(filters.occupancyTypeId)
  }

  const occupancyTimeFilters = getOccupancyTimeWhereClause(
    filters.occupancyTime ?? '',
    'o'
  )
  sqlWhereClause += occupancyTimeFilters.sqlWhereClause
  sqlParameters.push(...occupancyTimeFilters.sqlParameters)

  if ((filters.occupancyStartDateString ?? '') !== '') {
    sqlWhereClause += ' and o.occupancyStartDate = ?'
    sqlParameters.push(
      dateStringToInteger(filters.occupancyStartDateString as DateString)
    )
  }

  if ((filters.occupancyEffectiveDateString ?? '') !== '') {
    sqlWhereClause += ` and (
        o.occupancyEndDate is null
        or (o.occupancyStartDate <= ? and o.occupancyEndDate >= ?)
      )`
    sqlParameters.push(
      dateStringToInteger(filters.occupancyEffectiveDateString as DateString),
      dateStringToInteger(filters.occupancyEffectiveDateString as DateString)
    )
  }

  if ((filters.mapId ?? '') !== '') {
    sqlWhereClause += ' and l.mapId = ?'
    sqlParameters.push(filters.mapId)
  }

  if ((filters.lotTypeId ?? '') !== '') {
    sqlWhereClause += ' and l.lotTypeId = ?'
    sqlParameters.push(filters.lotTypeId)
  }

  if ((filters.workOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and o.lotOccupancyId in (select lotOccupancyId from WorkOrderLotOccupancies where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  if ((filters.notWorkOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and o.lotOccupancyId not in (select lotOccupancyId from WorkOrderLotOccupancies where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.notWorkOrderId)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

async function addInclusions(
  lotOccupancy: LotOccupancy,
  options: GetLotOccupanciesOptions,
  database: PoolConnection
): Promise<LotOccupancy> {
  if (options.includeFees) {
    lotOccupancy.lotOccupancyFees = await getLotOccupancyFees(
      lotOccupancy.lotOccupancyId,
      database
    )
  }

  if (options.includeTransactions) {
    lotOccupancy.lotOccupancyTransactions = await getLotOccupancyTransactions(
      lotOccupancy.lotOccupancyId,
      { includeIntegrations: false },
      database
    )
  }

  if (options.includeOccupants) {
    lotOccupancy.lotOccupancyOccupants = await getLotOccupancyOccupants(
      lotOccupancy.lotOccupancyId,
      database
    )
  }

  return lotOccupancy
}

export default async function getLotOccupancies(
  filters: GetLotOccupanciesFilters,
  options: GetLotOccupanciesOptions,
  connectedDatabase?: PoolConnection
): Promise<{ count: number; lotOccupancies: LotOccupancy[] }> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)

  const { sqlWhereClause, sqlParameters } = buildWhereClause(filters)

  let count = options.limit

  const isLimited = options.limit !== -1

  if (isLimited) {
    count = (
      database
        .prepare(
          `select count(*) as recordCount
          from LotOccupancies o
          left join Lots l on o.lotId = l.lotId
          ${sqlWhereClause}`
        )
        .get(sqlParameters) as { recordCount: number }
    ).recordCount
  }

  let lotOccupancies: LotOccupancy[] = []

  if (count !== 0) {
    lotOccupancies = database
      .prepare(
        `select o.lotOccupancyId,
          o.occupancyTypeId, t.occupancyType,
          o.lotId, lt.lotType, l.lotName,
          l.mapId, m.mapName,
          o.occupancyStartDate, userFn_dateIntegerToString(o.occupancyStartDate) as occupancyStartDateString,
          o.occupancyEndDate,  userFn_dateIntegerToString(o.occupancyEndDate) as occupancyEndDateString
          from LotOccupancies o
          left join OccupancyTypes t on o.occupancyTypeId = t.occupancyTypeId
          left join Lots l on o.lotId = l.lotId
          left join LotTypes lt on l.lotTypeId = lt.lotTypeId
          left join Maps m on l.mapId = m.mapId
          ${sqlWhereClause}
          order by o.occupancyStartDate desc, ifnull(o.occupancyEndDate, 99999999) desc, l.lotName, o.lotId, o.lotOccupancyId desc
          ${
            isLimited ? ` limit ${options.limit} offset ${options.offset}` : ''
          }`
      )
      .all(sqlParameters) as LotOccupancy[]

    if (!isLimited) {
      count = lotOccupancies.length
    }

    for (const lotOccupancy of lotOccupancies) {
      const occupancyType = await getOccupancyTypeById(
        lotOccupancy.occupancyTypeId!
      )

      if (occupancyType !== undefined) {
        lotOccupancy.printEJS = (
          occupancyType.occupancyTypePrints ?? []
        ).includes('*')
          ? getConfigProperty('settings.lotOccupancy.prints')[0]
          : occupancyType.occupancyTypePrints![0]
      }

      await addInclusions(lotOccupancy, options, database)
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return {
    count,
    lotOccupancies
  }
}
