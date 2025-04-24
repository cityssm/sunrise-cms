import type { BurialSiteType } from '../types/record.types.js'

import getBurialSiteTypeFields from './getBurialSiteTypeFields.js'
import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default async function getBurialSiteTypes(): Promise<BurialSiteType[]> {
  const database = await acquireConnection()

  const burialSiteTypes = database
    .prepare(
      `select burialSiteTypeId, burialSiteType, orderNumber
        from BurialSiteTypes
        where recordDelete_timeMillis is null
        order by orderNumber, burialSiteType`
    )
    .all() as BurialSiteType[]

  let expectedOrderNumber = -1

  for (const burialSiteType of burialSiteTypes) {
    expectedOrderNumber += 1

    if (burialSiteType.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'BurialSiteTypes',
        burialSiteType.burialSiteTypeId,
        expectedOrderNumber,
        database
      )

      burialSiteType.orderNumber = expectedOrderNumber
    }

    burialSiteType.burialSiteTypeFields = await getBurialSiteTypeFields(
      burialSiteType.burialSiteTypeId,
      database
    )
  }

  database.release()

  return burialSiteTypes
}
