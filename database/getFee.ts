import type { PoolConnection } from 'better-sqlite-pool'

import type { Fee } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getFee(
  feeId: number | string,
  connectedDatabase?: PoolConnection
): Promise<Fee | undefined> {
  const database = connectedDatabase ?? (await acquireConnection())

  const fee = database
    .prepare(
      `select f.feeId,
        f.feeCategoryId, c.feeCategory,
        f.feeName, f.feeDescription, f.feeAccount,
        f.contractTypeId, o.contractType,
        f.burialSiteTypeId, l.burialSiteType,
        ifnull(f.feeAmount, 0) as feeAmount, f.feeFunction,
        f.taxAmount, f.taxPercentage,
        f.includeQuantity, f.quantityUnit,
        f.isRequired, f.orderNumber
        from Fees f
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        left join ContractTypes o on f.contractTypeId = o.contractTypeId
        left join BurialSiteTypes l on f.burialSiteTypeId = l.burialSiteTypeId
        where f.recordDelete_timeMillis is null
        and f.feeId = ?`
    )
    .get(feeId) as Fee | undefined

  if (connectedDatabase === undefined) {
    database.release()
  }

  return fee
}
