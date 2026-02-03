import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Fee } from '../types/record.types.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

interface GetFeesFilters {
  burialSiteTypeId?: number | string
  contractTypeId?: number | string
}

export default function getFees(
  feeCategoryId: number,
  additionalFilters: GetFeesFilters,
  connectedDatabase?: sqlite.Database
): Fee[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const updateOrderNumbers =
    !database.readonly &&
    !(additionalFilters.burialSiteTypeId || additionalFilters.contractTypeId)

  let sqlWhereClause =
    ' where f.recordDelete_timeMillis is null and f.feeCategoryId = ?'

  const sqlParameters: unknown[] = [feeCategoryId]

  if (additionalFilters.contractTypeId) {
    sqlWhereClause += ' and (f.contractTypeId is null or f.contractTypeId = ?)'

    sqlParameters.push(additionalFilters.contractTypeId)
  }

  if (additionalFilters.burialSiteTypeId) {
    sqlWhereClause +=
      ' and (f.burialSiteTypeId is null or f.burialSiteTypeId = ?)'

    sqlParameters.push(additionalFilters.burialSiteTypeId)
  }

  const fees = database
    .prepare(/* sql */ `
      SELECT
        f.feeId,
        f.feeCategoryId,
        f.feeName,
        f.feeDescription,
        f.feeAccount,
        f.contractTypeId,
        ct.contractType,
        f.burialSiteTypeId,
        l.burialSiteType,
        ifnull(f.feeAmount, 0) AS feeAmount,
        f.feeFunction,
        f.taxAmount,
        f.taxPercentage,
        f.includeQuantity,
        f.quantityUnit,
        f.isRequired,
        f.orderNumber,
        ifnull(cf.contractFeeCount, 0) AS contractFeeCount
      FROM
        Fees f
        LEFT JOIN (
          SELECT
            feeId,
            count(contractId) AS contractFeeCount
          FROM
            ContractFees
          WHERE
            recordDelete_timeMillis IS NULL
          GROUP BY
            feeId
        ) cf ON f.feeId = cf.feeId
        LEFT JOIN ContractTypes ct ON f.contractTypeId = ct.contractTypeId
        LEFT JOIN BurialSiteTypes l ON f.burialSiteTypeId = l.burialSiteTypeId ${sqlWhereClause}
      ORDER BY
        f.orderNumber,
        f.feeName
    `)
    .all(sqlParameters) as Fee[]

  if (updateOrderNumbers) {
    let expectedOrderNumber = 0

    for (const fee of fees) {
      if (fee.orderNumber !== expectedOrderNumber) {
        updateRecordOrderNumber(
          'Fees',
          fee.feeId,
          expectedOrderNumber,
          database
        )
        fee.orderNumber = expectedOrderNumber
      }

      expectedOrderNumber += 1
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fees
}
