import { acquireConnection } from './pool.js'

export default async function deleteContractTransaction(
  contractId: number | string,
  transactionIndex: number | string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ContractTransactions
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and transactionIndex = ?`
    )
    .run(user.userName, Date.now(), contractId, transactionIndex)

  database.release()

  return result.changes > 0
}
