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
    .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        WorkOrderContracts
      WHERE
        workOrderId = ?
        AND contractId = ?
    `)
    .pluck()
    .get(addForm.workOrderId, addForm.contractId) as number | null | undefined

  if (recordDeleteTimeMillis === undefined) {
    database
      .prepare(/* sql */ `
        INSERT INTO
          WorkOrderContracts (
            workOrderId,
            contractId,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
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
      .prepare(/* sql */ `
        UPDATE WorkOrderContracts
        SET
          recordCreate_userName = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
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
