import { acquireConnection } from './pool.js'

export default async function deleteContractInterment(
  contractId: number | string,
  intermentNumber: number | string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ContractInterments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and intermentNumber = ?`
    )
    .run(user.userName, Date.now(), contractId, intermentNumber)

  database.release()

  return result.changes > 0
}
