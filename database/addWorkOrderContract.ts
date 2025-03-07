import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export interface AddForm {
  workOrderId: number | string
  contractId: number | string
}

export default async function addWorkOrderContract(
  addForm: AddForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

  const rightNowMillis = Date.now()

  const recordDeleteTimeMillis: number | null | undefined = database
    .prepare(
      `select recordDelete_timeMillis
        from WorkOrderContracts
        where workOrderId = ?
        and contractId = ?`
    )
    .pluck()
    .get(
      addForm.workOrderId,
      addForm.contractId
    ) as number | null | undefined

  if (recordDeleteTimeMillis === undefined) {
    database
      .prepare(
        `insert into WorkOrderContracts (
          workOrderId, contractId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?)`
      )
      .run(
        addForm.workOrderId,
        addForm.contractId,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  } else {
    if (recordDeleteTimeMillis !== null) {
      database
        .prepare(
          `update WorkOrderContracts
            set recordCreate_userName = ?,
            recordCreate_timeMillis = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?,
            recordDelete_userName = null,
            recordDelete_timeMillis = null
            where workOrderId = ?
            and contractId = ?`
        )
        .run(
          user.userName,
          rightNowMillis,
          user.userName,
          rightNowMillis,
          addForm.workOrderId,
          addForm.contractId
        )
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return true
}
