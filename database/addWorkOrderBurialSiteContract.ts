import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export interface AddWorkOrderBurialSiteContractOccupancyForm {
  workOrderId: number | string
  burialSiteContractId: number | string
}

export default async function addWorkOrderLotOccupancy(
  addForm: AddWorkOrderBurialSiteContractOccupancyForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

  const rightNowMillis = Date.now()

  const recordDeleteTimeMillis: number | null | undefined = database
    .prepare(
      `select recordDelete_timeMillis
        from WorkOrderBurialSiteContracts
        where workOrderId = ?
        and burialSiteContractId = ?`
    )
    .pluck()
    .get(
      addForm.workOrderId,
      addForm.burialSiteContractId
    ) as number | null | undefined

  if (recordDeleteTimeMillis === undefined) {
    database
      .prepare(
        `insert into WorkOrderBurialSiteContracts (
          workOrderId, burialSiteContractId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?)`
      )
      .run(
        addForm.workOrderId,
        addForm.burialSiteContractId,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  } else {
    if (recordDeleteTimeMillis !== null) {
      database
        .prepare(
          `update WorkOrderBurialSiteContracts
            set recordCreate_userName = ?,
            recordCreate_timeMillis = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?,
            recordDelete_userName = null,
            recordDelete_timeMillis = null
            where workOrderId = ?
            and burialSiteContractId = ?`
        )
        .run(
          user.userName,
          rightNowMillis,
          user.userName,
          rightNowMillis,
          addForm.workOrderId,
          addForm.burialSiteContractId
        )
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return true
}
