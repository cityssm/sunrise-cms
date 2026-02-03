import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface ContractFieldForm {
  contractId: number | string
  contractTypeFieldId: number | string
  fieldValue: string
}

export default function addOrUpdateContractField(
  fieldForm: ContractFieldForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  let result = database
    .prepare(/* sql */ `
      UPDATE ContractFields
      SET
        fieldValue = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractId = ?
        AND contractTypeFieldId = ?
    `)
    .run(
      fieldForm.fieldValue,
      user.userName,
      rightNowMillis,
      fieldForm.contractId,
      fieldForm.contractTypeFieldId
    )

  if (result.changes === 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          ContractFields (
            contractId,
            contractTypeFieldId,
            fieldValue,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        fieldForm.contractId,
        fieldForm.contractTypeFieldId,
        fieldForm.fieldValue,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
