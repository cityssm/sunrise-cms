import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export default async function deleteBurialSiteContractField(
  burialSiteContractId: number | string,
  contractTypeFieldId: number | string,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

  const result = database
    .prepare(
      `update BurialSiteContractFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteContractId = ?
        and contractTypeFieldId = ?`
    )
    .run(user.userName, Date.now(), burialSiteContractId, contractTypeFieldId)

  if (connectedDatabase === undefined) {
    database.release()
  }

  return result.changes > 0
}
