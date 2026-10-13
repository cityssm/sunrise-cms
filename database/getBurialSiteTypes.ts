import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { BurialSiteType } from '../types/record.types.js'

import getBurialSiteTypeFields from './getBurialSiteTypeFields.js'
import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getBurialSiteTypes(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): BurialSiteType[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const updateOrderNumbers = !includeDeleted

  const burialSiteTypes = database
    .prepare(/* sql */ `
      SELECT
        burialSiteTypeId,
        burialSiteType,
        bodyCapacityMax,
        crematedCapacityMax,
        isAvailableOnPortal,
        orderNumber
      FROM
        BurialSiteTypes ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        burialSiteType
    `)
    .all() as unknown as BurialSiteType[]

  let expectedOrderNumber = -1

  for (const burialSiteType of burialSiteTypes) {
    expectedOrderNumber += 1

    if (
      updateOrderNumbers &&
      burialSiteType.orderNumber !== expectedOrderNumber
    ) {
      updateRecordOrderNumber(
        'BurialSiteTypes',
        burialSiteType.burialSiteTypeId,
        expectedOrderNumber,
        database
      )

      burialSiteType.orderNumber = expectedOrderNumber
    }

    burialSiteType.burialSiteTypeFields = getBurialSiteTypeFields(
      burialSiteType.burialSiteTypeId,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return burialSiteTypes
}
