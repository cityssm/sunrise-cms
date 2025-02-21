import { acquireConnection } from './pool.js'

export default async function deleteWorkOrderBurialSiteContract(
  workOrderId: number | string,
  burialSiteContractId: number | string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update WorkOrderBurialSiteContracts
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and burialSiteContractId = ?`
    )
    .run(user.userName, Date.now(), workOrderId, burialSiteContractId)

  database.release()

  return result.changes > 0
}
