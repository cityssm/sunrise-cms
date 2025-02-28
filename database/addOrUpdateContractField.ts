import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export interface ContractFieldForm {
  contractId: string | number
  contractTypeFieldId: string | number
  fieldValue: string
}

export default async function addOrUpdateContractField(
  fieldForm: ContractFieldForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

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
    database.release()
  }

  return result.changes > 0
}
