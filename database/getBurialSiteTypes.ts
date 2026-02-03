import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteType } from '../types/record.types.js'

import getBurialSiteTypeFields from './getBurialSiteTypeFields.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default function getBurialSiteTypes(
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): BurialSiteType[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const updateOrderNumbers = !includeDeleted

  const burialSiteTypes = database
    .prepare(/* sql */ `
      SELECT
        burialSiteTypeId,
        burialSiteType,
        bodyCapacityMax,
        crematedCapacityMax,
        orderNumber
      FROM
        BurialSiteTypes ${includeDeleted
          ? ''
          : ' where recordDelete_timeMillis is null '}
      ORDER BY
        orderNumber,
        burialSiteType
    `)
    .all() as BurialSiteType[]

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
