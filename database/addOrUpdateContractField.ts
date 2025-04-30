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
    .prepare(
      `update ContractFields
        set fieldValue = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = null,
          recordDelete_timeMillis = null
        where contractId = ?
          and contractTypeFieldId = ?`
    )
    .run(
      fieldForm.fieldValue,
      user.userName,
      rightNowMillis,
      fieldForm.contractId,
      fieldForm.contractTypeFieldId
    )

  if (result.changes === 0) {
    result = database
      .prepare(
        `insert into ContractFields (
          contractId, contractTypeFieldId, fieldValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`
      )
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
