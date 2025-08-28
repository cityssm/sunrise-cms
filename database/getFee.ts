import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Fee } from '../types/record.types.js'

export default function getFee(
  feeId: number | string,
  connectedDatabase?: sqlite.Database
): Fee | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const fee = database
    .prepare(
      `select f.feeId,
        f.feeCategoryId, c.feeCategory,
        f.feeName, f.feeDescription, f.feeAccount,
        f.contractTypeId, ct.contractType,
        f.burialSiteTypeId, l.burialSiteType,
        ifnull(f.feeAmount, 0) as feeAmount, f.feeFunction,
        f.taxAmount, f.taxPercentage,
        f.includeQuantity, f.quantityUnit,
        f.isRequired, f.orderNumber
        from Fees f
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        left join ContractTypes ct on f.contractTypeId = ct.contractTypeId
        left join BurialSiteTypes l on f.burialSiteTypeId = l.burialSiteTypeId
        where f.recordDelete_timeMillis is null
        and f.feeId = ?`
    )
    .get(feeId) as Fee | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fee
}
