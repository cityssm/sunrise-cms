import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddForm {
  contractId: number | string
  workOrderId: number | string
}

export default function addWorkOrderContract(
  addForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordDeleteTimeMillis: number | null | undefined = database
    .prepare(
      `select recordDelete_timeMillis
        from WorkOrderContracts
        where workOrderId = ?
        and contractId = ?`
    )
    .pluck()
    .get(addForm.workOrderId, addForm.contractId) as number | null | undefined

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
  } else if (recordDeleteTimeMillis !== null) {
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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return true
}
