import type { IntermentCommittalType } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getIntermentCommittalTypes(): Promise<
  IntermentCommittalType[]
> {
  const database = await acquireConnection()

  const committalTypes = database
    .prepare(
      `select intermentCommittalTypeId, intermentCommittalType, orderNumber
        from IntermentCommittalTypes
        where recordDelete_timeMillis is null
        order by orderNumber, intermentCommittalType, intermentCommittalTypeId`
    )
    .all() as IntermentCommittalType[]

  database.release()

  return committalTypes
}
