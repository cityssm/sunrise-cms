import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { getContractTypeById } from '../helpers/functions.cache.js'
import {
  getLotNameWhereClause,
  getOccupancyTimeWhereClause,
  getOccupantNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { BurialSiteContract } from '../types/recordTypes.js'

import getBurialSiteContractFees from './getBurialSiteContractFees.js'
// import getLotOccupancyOccupants from './getLotOccupancyOccupants.js'
import getBurialSiteContractTransactions from './getBurialSiteContractTransactions.js'
import { acquireConnection } from './pool.js'

interface GetBurialSiteContractsFilters {
  burialSiteId?: number | string
  occupancyTime?: '' | 'past' | 'current' | 'future'
  contractStartDateString?: DateString
  occupancyEffectiveDateString?: string
  occupantName?: string
  contractTypeId?: number | string
  cemeteryId?: number | string
  burialSiteNameSearchType?: '' | 'startsWith' | 'endsWith'
  burialSiteName?: string
  burialSiteTypeId?: number | string
  workOrderId?: number | string
  notWorkOrderId?: number | string
}

interface GetBurialSiteContractsOptions {
  /** -1 for no limit */
  limit: number
  offset: number
  includeInterments: boolean
  includeFees: boolean
  includeTransactions: boolean
}

function buildWhereClause(filters: GetBurialSiteContractsFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ' where o.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.burialSiteId ?? '') !== '') {
    sqlWhereClause += ' and o.lotId = ?'
    sqlParameters.push(filters.burialSiteId)
  }

  const lotNameFilters = getLotNameWhereClause(
    filters.burialSiteName,
    filters.burialSiteNameSearchType ?? '',
    'l'
  )
  sqlWhereClause += lotNameFilters.sqlWhereClause
  sqlParameters.push(...lotNameFilters.sqlParameters)

  const occupantNameFilters = getOccupantNameWhereClause(
    filters.occupantName,
    'o'
  )
  if (occupantNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += ` and o.burialSiteContractId in (
        select burialSiteContractId from LotOccupancyOccupants o
        where recordDelete_timeMillis is null
        ${occupantNameFilters.sqlWhereClause})`
    sqlParameters.push(...occupantNameFilters.sqlParameters)
  }

  if ((filters.contractTypeId ?? '') !== '') {
    sqlWhereClause += ' and o.contractTypeId = ?'
    sqlParameters.push(filters.contractTypeId)
  }

  const occupancyTimeFilters = getOccupancyTimeWhereClause(
    filters.occupancyTime ?? '',
    'o'
  )
  sqlWhereClause += occupancyTimeFilters.sqlWhereClause
  sqlParameters.push(...occupancyTimeFilters.sqlParameters)

  if ((filters.contractStartDateString ?? '') !== '') {
    sqlWhereClause += ' and o.contractStartDate = ?'
    sqlParameters.push(
      dateStringToInteger(filters.contractStartDateString as DateString)
    )
  }

  if ((filters.occupancyEffectiveDateString ?? '') !== '') {
    sqlWhereClause += ` and (
        o.contractEndDate is null
        or (o.contractStartDate <= ? and o.contractEndDate >= ?)
      )`
    sqlParameters.push(
      dateStringToInteger(filters.occupancyEffectiveDateString as DateString),
      dateStringToInteger(filters.occupancyEffectiveDateString as DateString)
    )
  }

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
  }

  if ((filters.burialSiteTypeId ?? '') !== '') {
    sqlWhereClause += ' and l.burialSiteTypeId = ?'
    sqlParameters.push(filters.burialSiteTypeId)
  }

  if ((filters.workOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and o.burialSiteContractId in (select burialSiteContractId from WorkOrderBurialSiteContracts where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  if ((filters.notWorkOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and o.burialSiteContractId not in (select burialSiteContractId from WorkOrderBurialSiteContracts where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.notWorkOrderId)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

async function addInclusions(
  burialSiteContract: BurialSiteContract,
  options: GetBurialSiteContractsOptions,
  database: PoolConnection
): Promise<BurialSiteContract> {
  if (options.includeFees) {
    burialSiteContract.burialSiteContractFees = await getBurialSiteContractFees(
      burialSiteContract.burialSiteContractId,
      database
    )
  }

  if (options.includeTransactions) {
    burialSiteContract.burialSiteContractTransactions =
      await getBurialSiteContractTransactions(
        burialSiteContract.burialSiteContractId,
        { includeIntegrations: false },
        database
      )
  }

  /*
  if (options.includeInterments) {
    burialSiteContract.burialSiteContractInterments =
      await getLotOccupancyOccupants(
        burialSiteContract.burialSiteContractId,
        database
      )
  }
  */

  return burialSiteContract
}

export default async function getBurialSiteContracts(
  filters: GetBurialSiteContractsFilters,
  options: GetBurialSiteContractsOptions,
  connectedDatabase?: PoolConnection
): Promise<{ count: number; burialSiteContracts: BurialSiteContract[] }> {
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
          from BurialSiteContracts o
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          ${sqlWhereClause}`
        )
        .get(sqlParameters) as { recordCount: number }
    ).recordCount
  }

  let burialSiteContracts: BurialSiteContract[] = []

  if (count !== 0) {
    burialSiteContracts = database
      .prepare(
        `select o.burialSiteContractId,
          o.contractTypeId, t.contractType,
          o.burialSiteId, lt.burialSiteType,
          l.burialSiteNameSegment1,
          l.burialSiteNameSegment2,
          l.burialSiteNameSegment3,
          l.burialSiteNameSegment4,
          l.burialSiteNameSegment5,
          l.cemeteryId, m.cemeteryName,
          o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
          o.contractEndDate,  userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString
          from BurialSiteContracts o
          left join ContractTypes t on o.contractTypeId = t.contractTypeId
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          left join BurialSiteTypes lt on l.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          ${sqlWhereClause}
          order by o.contractStartDate desc, ifnull(o.contractEndDate, 99999999) desc,
            l.burialSiteNameSegment1,
            l.burialSiteNameSegment2,
            l.burialSiteNameSegment3,
            l.burialSiteNameSegment4,
            l.burialSiteNameSegment5,
            o.burialSiteId, o.burialSiteContractId desc
          ${
            isLimited ? ` limit ${options.limit} offset ${options.offset}` : ''
          }`
      )
      .all(sqlParameters) as BurialSiteContract[]

    if (!isLimited) {
      count = burialSiteContracts.length
    }

    for (const burialSiteContract of burialSiteContracts) {
      const contractType = await getContractTypeById(
        burialSiteContract.contractTypeId!
      )

      if (contractType !== undefined) {
        burialSiteContract.printEJS = (
          contractType.contractTypePrints ?? []
        ).includes('*')
          ? getConfigProperty('settings.contracts.prints')[0]
          : (contractType.contractTypePrints ?? [])[0]
      }

      await addInclusions(burialSiteContract, options, database)
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return {
    count,
    burialSiteContracts
  }
}
