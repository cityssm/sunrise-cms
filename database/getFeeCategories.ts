import { type SQLInputValue, DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { FeeCategory } from '../types/record.types.js'

import getFees from './getFees.js'
import updateRecordOrderNumber from './updateRecordOrderNumber.js'

interface GetFeeCategoriesFilters {
  burialSiteTypeId?: number | string
  contractTypeId?: number | string
  feeCategoryId?: number | string
}

interface GetFeeCategoriesOptions {
  includeFees?: boolean
}

export default function getFeeCategories(
  filters: GetFeeCategoriesFilters,
  options: GetFeeCategoriesOptions,
  connectedDatabase?: DatabaseSync
): FeeCategory[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const updateOrderNumbers =
    filters.burialSiteTypeId === undefined &&
    filters.contractTypeId === undefined &&
    (options.includeFees ?? false)

  let sqlWhereClause = ' WHERE recordDelete_timeMillis IS NULL'

  const sqlParameters: SQLInputValue[] = []

  if (
    filters.contractTypeId !== undefined &&
    (filters.contractTypeId ?? '') !== ''
  ) {
    sqlWhereClause += /* sql */ `
      AND feeCategoryId IN (
        SELECT
          feeCategoryId
        FROM
          Fees
        WHERE
          recordDelete_timeMillis IS NULL
          AND (
            contractTypeId IS NULL
            OR contractTypeId = ?
          )
      )
    `

    sqlParameters.push(filters.contractTypeId)
  }

  if (
    filters.burialSiteTypeId !== undefined &&
    (filters.burialSiteTypeId ?? '') !== ''
  ) {
    sqlWhereClause += /* sql */ `
      AND feeCategoryId IN (
        SELECT
          feeCategoryId
        FROM
          Fees
        WHERE
          recordDelete_timeMillis IS NULL
          AND (
            burialSiteTypeId IS NULL
            OR burialSiteTypeId = ?
          )
      )
    `

    sqlParameters.push(filters.burialSiteTypeId)
  }

  if (
    filters.feeCategoryId !== undefined &&
    (filters.feeCategoryId ?? '') !== ''
  ) {
    sqlWhereClause += ' AND feeCategoryId = ?'
    sqlParameters.push(filters.feeCategoryId)
  }

  const feeCategories = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        feeCategoryId,
        feeCategory,
        isGroupedFee,
        orderNumber
      FROM
        FeeCategories ${sqlWhereClause}
      ORDER BY
        orderNumber,
        feeCategory
    `)
    .all(...sqlParameters) as unknown as FeeCategory[]

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

      feeCategory.fees = getFees(feeCategory.feeCategoryId, filters, database)
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return feeCategories
}

export function getFeeCategory(
  feeCategoryId: number | string,
  connectedDatabase?: DatabaseSync
): FeeCategory | undefined {
  const feeCategories = getFeeCategories(
    {
      feeCategoryId
    },
    {
      includeFees: true
    },
    connectedDatabase
  )

  return feeCategories[0]
}
