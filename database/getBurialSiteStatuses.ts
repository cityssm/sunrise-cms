import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { BurialSiteStatus } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getBurialSiteStatuses(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): BurialSiteStatus[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const shouldUpdateOrderNumbers = !shouldIncludeDeletedRecords

  const statuses = database
    .prepare(/* sql */ `
      SELECT
        burialSiteStatusId,
        burialSiteStatus,
        orderNumber
      FROM
        BurialSiteStatuses ${shouldIncludeDeletedRecords
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        burialSiteStatus
    `)
    .all() as unknown as BurialSiteStatus[]

  if (shouldUpdateOrderNumbers) {
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
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return statuses
}
