import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  dateToInteger,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getCachedContractTypeById } from '../helpers/cache/contractTypes.cache.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import {
  sanitizeLimit,
  sanitizeOffset,
  sunriseDB
} from '../helpers/database.helpers.js'
import {
  getBurialSiteNameWhereClause,
  getContractTimeWhereClause,
  getDeceasedNameWhereClause
} from '../helpers/functions.sqlFilters.js'
import type { Contract } from '../types/record.types.js'

import getContractFees from './getContractFees.js'
import getContractInterments from './getContractInterments.js'
import getContractTransactions from './getContractTransactions.js'

export interface GetContractsFilters {
  burialSiteId?: number | string

  contractEffectiveDateString?: string
  contractStartDateString?: DateString
  contractTime?: '' | 'current' | 'future' | 'past'

  cemeteryId?: number | string
  contractTypeId?: number | string
  deceasedName?: string

  burialSiteName?: string
  burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith'

  burialSiteTypeId?: number | string

  funeralHomeId?: number | string
  funeralTime?: '' | 'upcoming'

  notWorkOrderId?: number | string
  workOrderId?: number | string

  notContractId?: number | string

  notRelatedContractId?: number | string
  relatedContractId?: number | string
}

const validOrderByStrings = [
  'c.funeralDate, c.funeralTime, c.contractId'
] as const

export interface GetContractsOptions {
  /** -1 for no limit */
  limit: number | string
  offset: number | string

  orderBy?: (typeof validOrderByStrings)[number]

  includeFees: boolean
  includeInterments: boolean
  includeTransactions: boolean
}

export default async function getContracts(
  filters: GetContractsFilters,
  options: GetContractsOptions,
  connectedDatabase?: sqlite.Database
): Promise<{ contracts: Contract[]; count: number }> {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
  )

  const { sqlParameters, sqlWhereClause } = buildWhereClause(filters)

  let count =
    typeof options.limit === 'string'
      ? Number.parseInt(options.limit, 10)
      : options.limit

  const isLimited = options.limit !== -1

  if (isLimited) {
    count = database
      .prepare(
        `select count(*) as recordCount
          from Contracts c
          left join BurialSites l on c.burialSiteId = l.burialSiteId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          ${sqlWhereClause}`
      )
      .pluck()
      .get(sqlParameters) as number
  }

  let contracts: Contract[] = []

  if (count !== 0) {
    const sqlLimitClause = isLimited
      ? ` limit ${sanitizeLimit(options.limit)}
          offset ${sanitizeOffset(options.offset)}`
      : ''

    contracts = database
      .prepare(
        `select c.contractId,
            c.contractTypeId, t.contractType, t.isPreneed,
            c.burialSiteId, lt.burialSiteType, l.burialSiteName,
            case when l.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
            l.cemeteryId, m.cemeteryName,

            c.contractStartDate, userFn_dateIntegerToString(c.contractStartDate) as contractStartDateString,
            c.contractEndDate, userFn_dateIntegerToString(c.contractEndDate) as contractEndDateString,

            (c.contractEndDate is null or c.contractEndDate > cast(strftime('%Y%m%d', date()) as integer)) as contractIsActive,
            (c.contractStartDate > cast(strftime('%Y%m%d', date()) as integer)) as contractIsFuture,

            c.purchaserName, c.purchaserAddress1, c.purchaserAddress2,
            c.purchaserCity, c.purchaserProvince, c.purchaserPostalCode,
            c.purchaserPhoneNumber, c.purchaserEmail, c.purchaserRelationship,
            c.funeralHomeId, c.funeralDirectorName, f.funeralHomeName,

            c.funeralDate, userFn_dateIntegerToString(c.funeralDate) as funeralDateString,
            
            c.funeralTime,
            userFn_timeIntegerToString(c.funeralTime) as funeralTimeString,
            userFn_timeIntegerToPeriodString(c.funeralTime) as funeralTimePeriodString,

            c.directionOfArrival,
            c.committalTypeId, cm.committalType
            
          from Contracts c
          left join ContractTypes t on c.contractTypeId = t.contractTypeId
          left join CommittalTypes cm on c.committalTypeId = cm.committalTypeId
          left join BurialSites l on c.burialSiteId = l.burialSiteId
          left join BurialSiteTypes lt on l.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          left join FuneralHomes f on c.funeralHomeId = f.funeralHomeId
          ${sqlWhereClause}
          ${
            options.orderBy !== undefined &&
            validOrderByStrings.includes(options.orderBy)
              ? ` order by ${options.orderBy}`
              : ` order by c.contractStartDate desc, ifnull(c.contractEndDate, 99999999) desc,
                  l.burialSiteNameSegment1,
                  l.burialSiteNameSegment2,
                  l.burialSiteNameSegment3,
                  l.burialSiteNameSegment4,
                  l.burialSiteNameSegment5,
                  c.burialSiteId, c.contractId desc`
          }
          ${sqlLimitClause}`
      )
      .all(sqlParameters) as Contract[]

    if (!isLimited) {
      count = contracts.length
    }

    for (const contract of contracts) {
      const contractType = getCachedContractTypeById(contract.contractTypeId)

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
    database.close()
  }

  return {
    contracts,
    count
  }
}

async function addInclusions(
  contract: Contract,
  options: GetContractsOptions,
  database: sqlite.Database
): Promise<Contract> {
  if (options.includeFees) {
    contract.contractFees = getContractFees(contract.contractId, database)
  }

  if (options.includeTransactions) {
    contract.contractTransactions = await getContractTransactions(
      contract.contractId,
      { includeIntegrations: false },
      database
    )
  }

  if (options.includeInterments) {
    contract.contractInterments = getContractInterments(
      contract.contractId,
      database
    )
  }

  return contract
}

function addBurialSiteFilters(
  filters: GetContractsFilters,
  sqlWhereClause: string,
  sqlParameters: unknown[]
): { sqlWhereClause: string; sqlParameters: unknown[] } {
  let whereClause = sqlWhereClause
  const parameters = [...sqlParameters]

  if ((filters.burialSiteId ?? '') !== '') {
    whereClause += ' and c.burialSiteId = ?'
    parameters.push(filters.burialSiteId)
  }

  const burialSiteNameFilters = getBurialSiteNameWhereClause(
    filters.burialSiteName,
    filters.burialSiteNameSearchType ?? '',
    'l'
  )
  whereClause += burialSiteNameFilters.sqlWhereClause
  parameters.push(...burialSiteNameFilters.sqlParameters)

  if ((filters.burialSiteTypeId ?? '') !== '') {
    whereClause += ' and l.burialSiteTypeId = ?'
    parameters.push(filters.burialSiteTypeId)
  }

  return { sqlWhereClause: whereClause, sqlParameters: parameters }
}

function addContractFilters(
  filters: GetContractsFilters,
  sqlWhereClause: string,
  sqlParameters: unknown[]
): { sqlWhereClause: string; sqlParameters: unknown[] } {
  let whereClause = sqlWhereClause
  const parameters = [...sqlParameters]

  if ((filters.contractTypeId ?? '') !== '') {
    whereClause += ' and c.contractTypeId = ?'
    parameters.push(filters.contractTypeId)
  }

  const contractTimeFilters = getContractTimeWhereClause(
    filters.contractTime ?? '',
    'c'
  )
  whereClause += contractTimeFilters.sqlWhereClause
  parameters.push(...contractTimeFilters.sqlParameters)

  if ((filters.contractStartDateString ?? '') !== '') {
    whereClause += ' and c.contractStartDate = ?'
    parameters.push(
      dateStringToInteger(filters.contractStartDateString as DateString)
    )
  }

  if ((filters.contractEffectiveDateString ?? '') !== '') {
    whereClause += ` and (
        c.contractEndDate is null
        or (c.contractStartDate <= ? and c.contractEndDate >= ?)
      )`
    parameters.push(
      dateStringToInteger(filters.contractEffectiveDateString as DateString),
      dateStringToInteger(filters.contractEffectiveDateString as DateString)
    )
  }

  return { sqlWhereClause: whereClause, sqlParameters: parameters }
}

function addLocationAndTypeFilters(
  filters: GetContractsFilters,
  sqlWhereClause: string,
  sqlParameters: unknown[]
): { sqlWhereClause: string; sqlParameters: unknown[] } {
  let whereClause = sqlWhereClause
  const parameters = [...sqlParameters]

  if ((filters.cemeteryId ?? '') !== '') {
    whereClause += ' and (m.cemeteryId = ? or m.parentCemeteryId = ?)'
    parameters.push(filters.cemeteryId, filters.cemeteryId)
  }

  if ((filters.funeralHomeId ?? '') !== '') {
    whereClause += ' and c.funeralHomeId = ?'
    parameters.push(filters.funeralHomeId)
  }

  if ((filters.funeralTime ?? '') === 'upcoming') {
    whereClause += ' and c.funeralDate >= ?'
    parameters.push(dateToInteger(new Date()))
  }

  return { sqlWhereClause: whereClause, sqlParameters: parameters }
}

function addWorkOrderAndRelationFilters(
  filters: GetContractsFilters,
  sqlWhereClause: string,
  sqlParameters: unknown[]
): { sqlWhereClause: string; sqlParameters: unknown[] } {
  let whereClause = sqlWhereClause
  const parameters = [...sqlParameters]

  if ((filters.workOrderId ?? '') !== '') {
    whereClause +=
      ' and c.contractId in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)'
    parameters.push(filters.workOrderId)
  }

  if ((filters.notWorkOrderId ?? '') !== '') {
    whereClause +=
      ' and c.contractId not in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)'
    parameters.push(filters.notWorkOrderId)
  }

  if ((filters.notContractId ?? '') !== '') {
    whereClause += ' and c.contractId <> ?'
    parameters.push(filters.notContractId)
  }

  if ((filters.relatedContractId ?? '') !== '') {
    whereClause += ` and (
        c.contractId in (select contractIdA from RelatedContracts where contractIdB = ?)
        or c.contractId in (select contractIdB from RelatedContracts where contractIdA = ?)
      )`
    parameters.push(filters.relatedContractId, filters.relatedContractId)
  }

  if ((filters.notRelatedContractId ?? '') !== '') {
    whereClause += ` and c.contractId not in (select contractIdA from RelatedContracts where contractIdB = ?)
      and c.contractId not in (select contractIdB from RelatedContracts where contractIdA = ?)`

    parameters.push(
      filters.notRelatedContractId,
      filters.notRelatedContractId
    )
  }

  return { sqlWhereClause: whereClause, sqlParameters: parameters }
}

function buildWhereClause(filters: GetContractsFilters): {
  sqlParameters: unknown[]
  sqlWhereClause: string
} {
  let sqlWhereClause = ' where c.recordDelete_timeMillis is null'
  let sqlParameters: unknown[] = []

  // Handle deceased name filter
  const deceasedNameFilters = getDeceasedNameWhereClause(
    filters.deceasedName,
    'c'
  )
  if (deceasedNameFilters.sqlParameters.length > 0) {
    sqlWhereClause += ` and c.contractId in (
        select contractId from ContractInterments c
        where recordDelete_timeMillis is null
        ${deceasedNameFilters.sqlWhereClause})`
    sqlParameters.push(...deceasedNameFilters.sqlParameters)
  }

  // Apply filter groups
  const burialSiteResult = addBurialSiteFilters(filters, sqlWhereClause, sqlParameters)
  const contractResult = addContractFilters(filters, burialSiteResult.sqlWhereClause, burialSiteResult.sqlParameters)
  const locationResult = addLocationAndTypeFilters(filters, contractResult.sqlWhereClause, contractResult.sqlParameters)
  const finalResult = addWorkOrderAndRelationFilters(filters, locationResult.sqlWhereClause, locationResult.sqlParameters)

  return {
    sqlParameters: finalResult.sqlParameters,
    sqlWhereClause: finalResult.sqlWhereClause
  }
}
