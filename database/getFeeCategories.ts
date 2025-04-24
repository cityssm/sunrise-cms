import type { PoolConnection } from 'better-sqlite-pool'

import type { FeeCategory } from '../types/record.types.js'

import getFees from './getFees.js'
import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

interface GetFeeCategoriesFilters {
  burialSiteTypeId?: number | string
  contractTypeId?: number | string
  feeCategoryId?: number | string
}

interface GetFeeCategoriesOptions {
  includeFees?: boolean
}

export default async function getFeeCategories(
  filters: GetFeeCategoriesFilters,
  options: GetFeeCategoriesOptions,
  connectedDatabase?: PoolConnection
): Promise<FeeCategory[]> {
  const updateOrderNumbers =
    !(filters.burialSiteTypeId || filters.contractTypeId) && options.includeFees

  const database = await acquireConnection()

  let sqlWhereClause = ' where recordDelete_timeMillis is null'

  const sqlParameters: unknown[] = []

  if ((filters.contractTypeId ?? '') !== '') {
    sqlWhereClause += ` and feeCategoryId in (
        select feeCategoryId from Fees where recordDelete_timeMillis is null and (contractTypeId is null or contractTypeId = ?))`

    sqlParameters.push(filters.contractTypeId)
  }

  if ((filters.burialSiteTypeId ?? '') !== '') {
    sqlWhereClause += ` and feeCategoryId in (
        select feeCategoryId from Fees where recordDelete_timeMillis is null and (burialSiteTypeId is null or burialSiteTypeId = ?))`

    sqlParameters.push(filters.burialSiteTypeId)
  }

  if ((filters.feeCategoryId ?? '') !== '') {
    sqlWhereClause += ` and feeCategoryId = ?`
    sqlParameters.push(filters.feeCategoryId)
  }

  const feeCategories = database
    .prepare(
      `select feeCategoryId, feeCategory, isGroupedFee, orderNumber
        from FeeCategories
        ${sqlWhereClause}
        order by orderNumber, feeCategory`
    )
    .all(sqlParameters) as FeeCategory[]

  if (options.includeFees ?? false) {
    let expectedOrderNumber = 0

    for (const feeCategory of feeCategories) {
      if (
        updateOrderNumbers &&
        feeCategory.orderNumber !== expectedOrderNumber
      ) {
        updateRecordOrderNumber(
          'FeeCategories',
          feeCategory.feeCategoryId,
          expectedOrderNumber,
          database
        )

        feeCategory.orderNumber = expectedOrderNumber
      }

      expectedOrderNumber += 1

      feeCategory.fees = await getFees(
        feeCategory.feeCategoryId,
        filters,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return feeCategories
}

export async function getFeeCategory(
  feeCategoryId: number | string,
  connectedDatabase?: PoolConnection
): Promise<FeeCategory | undefined> {
  const feeCategories = await getFeeCategories(
    {
      feeCategoryId
    },
    {
      includeFees: true
    },
    connectedDatabase
  )

  if (feeCategories.length > 0) {
    return feeCategories[0]
  }

  return undefined
}
