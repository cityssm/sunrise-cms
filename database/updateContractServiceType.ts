import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateForm {
  contractId: number | string
  serviceTypeId: number | string
  contractServiceDetails?: string
}

export default function updateContractServiceType(
  updateForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const info = database
    .prepare(/* sql */ `
      UPDATE
        ContractServiceTypes
      SET
        contractServiceDetails = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractId = ?
        AND serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.contractServiceDetails ?? '',
      user.userName,
      Date.now(),
      updateForm.contractId,
      updateForm.serviceTypeId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return info.changes > 0
}
