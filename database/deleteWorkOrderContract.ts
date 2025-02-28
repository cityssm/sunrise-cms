import { acquireConnection } from './pool.js'

export default async function deleteWorkOrderContract(
  workOrderId: number | string,
  contractId: number | string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update WorkOrderContracts
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and contractId = ?`
    )
    .run(user.userName, Date.now(), workOrderId, contractId)

  database.release()

  return result.changes > 0
}
