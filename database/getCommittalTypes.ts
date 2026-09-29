import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { CommittalType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getCommittalTypes(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): CommittalType[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const committalTypes = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        committalTypeId,
        committalTypeKey,
        committalType,
        isAvailableOnPortal,
        orderNumber
      FROM
        CommittalTypes ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        committalType,
        committalTypeId
    `)
    .all() as unknown as CommittalType[]

  let expectedOrderNumber = -1

  for (const committalType of committalTypes) {
    expectedOrderNumber += 1

    if (committalType.orderNumber === expectedOrderNumber) {
      continue
    }

    updateRecordOrderNumber(
      'CommittalTypes',
      committalType.committalTypeId,
      expectedOrderNumber,
      database
    )

    committalType.orderNumber = expectedOrderNumber
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return committalTypes
}
