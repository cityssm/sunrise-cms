import type { CommittalType } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default async function getCommittalTypes(): Promise<CommittalType[]> {
  const database = await acquireConnection()

  const committalTypes = database
    .prepare(
      `select committalTypeId, committalTypeKey, committalType, orderNumber
        from CommittalTypes
        where recordDelete_timeMillis is null
        order by orderNumber, committalType, committalTypeId`
    )
    .all() as CommittalType[]

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

  database.release()

  return committalTypes
}
