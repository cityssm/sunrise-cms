import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteStatus } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getBurialSiteStatuses(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): BurialSiteStatus[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const updateOrderNumbers = !includeDeleted

  const statuses = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        burialSiteStatusId,
        burialSiteStatus,
        orderNumber
      FROM
        BurialSiteStatuses ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        burialSiteStatus
    `)
    .all() as unknown as BurialSiteStatus[]

  if (updateOrderNumbers) {
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
