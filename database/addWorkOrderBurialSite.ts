import { acquireConnection } from './pool.js'

export interface AddWorkOrderLotForm {
  workOrderId: number | string
  burialSiteId: number | string
}

export default async function addWorkOrderBurialSite(
  workOrderLotForm: AddWorkOrderLotForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const row = database
    .prepare(
      `select recordDelete_timeMillis
        from WorkOrderBurialSites
        where workOrderId = ?
        and burialSiteId = ?`
    )
    .get(workOrderLotForm.workOrderId, workOrderLotForm.burialSiteId) as
    | {
        recordDelete_timeMillis?: number
      }
    | undefined

  if (row === undefined) {
    database
      .prepare(
        `insert into WorkOrderBurialSites (
          workOrderId, burialSiteId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?)`
      )
      .run(
        workOrderLotForm.workOrderId,
        workOrderLotForm.burialSiteId,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  } else {
    if (row.recordDelete_timeMillis) {
      database
        .prepare(
          `update WorkOrderBurialSites
            set recordCreate_userName = ?,
            recordCreate_timeMillis = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?,
            recordDelete_userName = null,
            recordDelete_timeMillis = null
            where workOrderId = ?
            and burialSiteId = ?`
        )
        .run(
          user.userName,
          rightNowMillis,
          user.userName,
          rightNowMillis,
          workOrderLotForm.workOrderId,
          workOrderLotForm.burialSiteId
        )
    }
  }

  database.release()

  return true
}
