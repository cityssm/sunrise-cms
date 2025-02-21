import { acquireConnection } from './pool.js'

export default async function deleteWorkOrderBurialSite(
  workOrderId: number | string,
  burialSiteId: number | string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update WorkOrderBurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and burialSiteId = ?`
    )
    .run(user.userName, Date.now(), workOrderId, burialSiteId)

  database.release()

  return result.changes > 0
}
