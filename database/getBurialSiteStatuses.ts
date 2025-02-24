import type { BurialSiteStatus } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default async function getBurialSiteStatuses(): Promise<BurialSiteStatus[]> {
  const database = await acquireConnection()

  const statuses = database
    .prepare(
      `select burialSiteStatusId, burialSiteStatus, orderNumber
        from BurialSiteStatuses
        where recordDelete_timeMillis is null
        order by orderNumber, burialSiteStatus`
    )
    .all() as BurialSiteStatus[]

  let expectedOrderNumber = 0

  for (const status of statuses) {
    if (status.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'BurialSiteStatuses',
        status.burialSiteStatusId,
        expectedOrderNumber,
        database
      )
      status.orderNumber = expectedOrderNumber
    }

    expectedOrderNumber += 1
  }

  database.release()

  return statuses
}
