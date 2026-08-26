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
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractId = ?
        AND contractTypeFieldId = ?
    `)
    .run(
      fieldForm.fieldValue,
      user.username,
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
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        fieldForm.contractId,
        fieldForm.contractTypeFieldId,
        fieldForm.fieldValue,
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
