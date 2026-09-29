import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Fee } from '../types/record.types.js'

export default function getFee(
  feeId: number | string,
  connectedDatabase?: DatabaseSync
): Fee | undefined {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const fee = database
    .prepare(/* sql */ `
      SELECT
        f.feeId,
        f.feeCategoryId,
        c.feeCategory,
        f.feeName,
        f.feeDescription,
        f.feeAccount,
        f.contractTypeId,
        ct.contractType,
        f.burialSiteTypeId,
        l.burialSiteType,
        IFNULL(f.feeAmount, 0) AS feeAmount,
        f.feeFunction,
        f.taxAmount,
        f.taxPercentage,
        f.includeQuantity,
        f.quantityUnit,
        f.isRequired,
        f.orderNumber
      FROM
        Fees f
        LEFT JOIN FeeCategories c ON f.feeCategoryId = c.feeCategoryId
        LEFT JOIN ContractTypes ct ON f.contractTypeId = ct.contractTypeId
        LEFT JOIN BurialSiteTypes l ON f.burialSiteTypeId = l.burialSiteTypeId
      WHERE
        f.recordDelete_timeMillis IS NULL
        AND f.feeId = ?
    `)
    .get(feeId) as Fee | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fee
}
