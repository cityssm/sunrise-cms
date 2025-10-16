import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { CommittalType } from '../types/record.types.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default function getCommittalTypes(
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): CommittalType[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const updateOrderNumbers = !database.readonly && !includeDeleted

  const committalTypes = database
    .prepare(
      `select committalTypeId, committalTypeKey, committalType, orderNumber
        from CommittalTypes
        ${includeDeleted ? '' : ' where recordDelete_timeMillis is null '}
        order by orderNumber, committalType, committalTypeId`
    )
    .all() as CommittalType[]

  if (updateOrderNumbers) {
    let expectedOrderNumber = -1

    for (const committalType of committalTypes) {
      expectedOrderNumber += 1

      if (committalType.orderNumber !== expectedOrderNumber) {
        updateRecordOrderNumber(
          'CommittalTypes',
          committalType.committalTypeId,
          expectedOrderNumber,
          database
        )

        committalType.orderNumber = expectedOrderNumber
      }
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return committalTypes
}
