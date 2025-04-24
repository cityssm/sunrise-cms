import type { PoolConnection } from 'better-sqlite-pool'

import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { getContractTypeById } from '../helpers/functions.cache.js'
import {
  getBurialSiteNameWhereClause,
  getContractTimeWhereClause,
  getDeceasedNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { Contract } from '../types/record.types.js'

import getContractFees from './getContractFees.js'
import getContractInterments from './getContractInterments.js'
import getContractTransactions from './getContractTransactions.js'
import { acquireConnection } from './pool.js'

export interface GetContractsFilters {
  burialSiteId?: number | string

  contractEffectiveDateString?: string
  contractStartDateString?: DateString
  contractTime?: '' | 'current' | 'future' | 'past'

  deceasedName?: string
  contractTypeId?: number | string
  cemeteryId?: number | string

  burialSiteName?: string
  burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith'

  burialSiteTypeId?: number | string
  funeralHomeId?: number | string

  notWorkOrderId?: number | string
  workOrderId?: number | string
}

export interface GetContractsOptions {
  /** -1 for no limit */
  limit: number | string
  offset: number | string
  includeInterments: boolean
  includeFees: boolean
  includeTransactions: boolean
}

export default async function getContracts(
  filters: GetContractsFilters,
  options: GetContractsOptions,
  connectedDatabase?: PoolConnection
): Promise<{ count: number; contracts: Contract[] }> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)

  const { sqlWhereClause, sqlParameters } = buildWhereClause(filters)

  let count =
    typeof options.limit === 'string'
      ? Number.parseInt(options.limit, 10)
      : options.limit

  const isLimited = options.limit !== -1

  if (isLimited) {
    count = (
      database
        .prepare(
          `select count(*) as recordCount
            from Contracts o
            left join BurialSites l on o.burialSiteId = l.burialSiteId
            left join Cemeteries m on l.cemeteryId = m.cemeteryId
            ${sqlWhereClause}`
        )
        .get(sqlParameters) as { recordCount: number }
    ).recordCount
  }

  let contracts: Contract[] = []

  if (count !== 0) {
    contracts = database
      .prepare(
        `select o.contractId,
          o.contractTypeId, t.contractType, t.isPreneed,
          o.burialSiteId, lt.burialSiteType, l.burialSiteName,
          l.cemeteryId, m.cemeteryName,
          o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
          o.contractEndDate, userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString,
          o.purchaserName, o.purchaserAddress1, o.purchaserAddress2,
          o.purchaserCity, o.purchaserProvince, o.purchaserPostalCode,
          o.purchaserPhoneNumber, o.purchaserEmail, o.purchaserRelationship,
          o.funeralHomeId, o.funeralDirectorName, f.funeralHomeName,

          o.funeralDate, userFn_dateIntegerToString(o.funeralDate) as funeralDateString,
          o.funeralTime, userFn_timeIntegerToString(o.funeralTime) as funeralTimeString,
          o.committalTypeId, c.committalType
          from Contracts o
          left join ContractTypes t on o.contractTypeId = t.contractTypeId
          left join CommittalTypes c on o.committalTypeId = c.committalTypeId
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          left join BurialSiteTypes lt on l.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          left join FuneralHomes f on o.funeralHomeId = f.funeralHomeId
          ${sqlWhereClause}
          order by o.contractStartDate desc, ifnull(o.contractEndDate, 99999999) desc,
            l.burialSiteNameSegment1,
            l.burialSiteNameSegment2,
            l.burialSiteNameSegment3,
            l.burialSiteNameSegment4,
            l.burialSiteNameSegment5,
            o.burialSiteId, o.contractId desc
          ${
            isLimited ? ` limit ${options.limit} offset ${options.offset}` : ''
          }`
      )
      .all(sqlParameters) as Contract[]

    if (!isLimited) {
      count = contracts.length
    }

    for (const contract of contracts) {
      const contractType = await getContractTypeById(contract.contractTypeId)

      if (contractType !== undefined) {
        contract.printEJS = (contractType.contractTypePrints ?? []).includes(
          '*'
        )
          ? getConfigProperty('settings.contracts.prints')[0]
          : (contractType.contractTypePrints ?? [])[0]
      }

      await addInclusions(contract, options, database)
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return {
    count,
    contracts
  }
}

async function addInclusions(
  contract: Contract,
  options: GetContractsOptions,
  database: PoolConnection
): Promise<Contract> {
  if (options.includeFees) {
    contract.contractFees = await getContractFees(contract.contractId, database)
  }

  if (options.includeTransactions) {
    contract.contractTransactions = await getContractTransactions(
      contract.contractId,
      { includeIntegrations: false },
      database
    )
  }

  if (options.includeInterments) {
    contract.contractInterments = await getContractInterments(
      contract.contractId,
      database
    )
  }

  return contract
}

// eslint-disable-next-line complexity
function buildWhereClause(filters: GetContractsFilters): {
  sqlWhereClause: string
  sqlParameters: unknown[]
} {
  let sqlWhereClause = ' where o.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.burialSiteId ?? '') !== '') {
    sqlWhereClause += ' and o.burialSiteId = ?'
    sqlParameters.push(filters.burialSiteId)
  }

  const burialSiteNameFilters = getBurialSiteNameWhereClause(
    filters.burialSiteName,
    filters.burialSiteNameSearchType ?? '',
    'l'
  )
  sqlWhereClause += burialSiteNameFilters.sqlWhereClause
  sqlParameters.push(...burialSiteNameFilters.sqlParameters)

  const deceasedNameFilters = getDeceasedNameWhereClause(
    filters.deceasedName,
    'o'
  )
  if (deceasedNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += ` and o.contractId in (
        select contractId from ContractInterments o
        where recordDelete_timeMillis is null
        ${deceasedNameFilters.sqlWhereClause})`
    sqlParameters.push(...deceasedNameFilters.sqlParameters)
  }

  if ((filters.contractTypeId ?? '') !== '') {
    sqlWhereClause += ' and o.contractTypeId = ?'
    sqlParameters.push(filters.contractTypeId)
  }

  const contractTimeFilters = getContractTimeWhereClause(
    filters.contractTime ?? '',
    'o'
  )
  sqlWhereClause += contractTimeFilters.sqlWhereClause
  sqlParameters.push(...contractTimeFilters.sqlParameters)

  if ((filters.contractStartDateString ?? '') !== '') {
    sqlWhereClause += ' and o.contractStartDate = ?'
    sqlParameters.push(
      dateStringToInteger(filters.contractStartDateString as DateString)
    )
  }

  if ((filters.contractEffectiveDateString ?? '') !== '') {
    sqlWhereClause += ` and (
        o.contractEndDate is null
        or (o.contractStartDate <= ? and o.contractEndDate >= ?)
      )`
    sqlParameters.push(
      dateStringToInteger(filters.contractEffectiveDateString as DateString),
      dateStringToInteger(filters.contractEffectiveDateString as DateString)
    )
  }

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and (m.cemeteryId = ? or m.parentCemeteryId = ?)'
    sqlParameters.push(filters.cemeteryId, filters.cemeteryId)
  }

  if ((filters.burialSiteTypeId ?? '') !== '') {
    sqlWhereClause += ' and l.burialSiteTypeId = ?'
    sqlParameters.push(filters.burialSiteTypeId)
  }

  if ((filters.funeralHomeId ?? '') !== '') {
    sqlWhereClause += ' and o.funeralHomeId = ?'
    sqlParameters.push(filters.funeralHomeId)
  }

  if ((filters.workOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and o.contractId in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.workOrderId)
  }

  if ((filters.notWorkOrderId ?? '') !== '') {
    sqlWhereClause +=
      ' and o.contractId not in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)'
    sqlParameters.push(filters.notWorkOrderId)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}
