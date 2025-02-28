import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export default async function deleteContractField(
  contractId: number | string,
  contractTypeFieldId: number | string,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

  const result = database
    .prepare(
      `update ContractFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and contractTypeFieldId = ?`
    )
    .run(user.userName, Date.now(), contractId, contractTypeFieldId)

  if (connectedDatabase === undefined) {
    database.release()
  }

  return result.changes > 0
}
