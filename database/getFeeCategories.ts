import type { FeeCategory } from '../types/recordTypes.js'

import { getFees } from './getFees.js'
import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

interface GetFeeCategoriesFilters {
  occupancyTypeId?: number | string
  lotTypeId?: number | string
}

interface GetFeeCategoriesOptions {
  includeFees?: boolean
}

export async function getFeeCategories(
  filters: GetFeeCategoriesFilters,
  options: GetFeeCategoriesOptions
): Promise<FeeCategory[]> {
  const updateOrderNumbers =
    !(filters.lotTypeId || filters.occupancyTypeId) && options.includeFees

  const database = await acquireConnection()

  let sqlWhereClause = ' where recordDelete_timeMillis is null'

  const sqlParameters: unknown[] = []

  if ((filters.occupancyTypeId ?? '') !== '') {
    sqlWhereClause +=
      ' and feeCategoryId in (' +
      'select feeCategoryId from Fees' +
      ' where recordDelete_timeMillis is null' +
      ' and (occupancyTypeId is null or occupancyTypeId = ?))'

    sqlParameters.push(filters.occupancyTypeId)
  }

  if ((filters.lotTypeId ?? '') !== '') {
    sqlWhereClause +=
      ' and feeCategoryId in (' +
      'select feeCategoryId from Fees' +
      ' where recordDelete_timeMillis is null' +
      ' and (lotTypeId is null or lotTypeId = ?))'

    sqlParameters.push(filters.lotTypeId)
  }

  const feeCategories = database
    .prepare(
      'select feeCategoryId, feeCategory, orderNumber' +
        ' from FeeCategories' +
        sqlWhereClause +
        ' order by orderNumber, feeCategory'
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

  database.release()

  return feeCategories
}

export default getFeeCategories
