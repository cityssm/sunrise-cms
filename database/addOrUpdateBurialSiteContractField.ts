import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export interface BurialSiteContractFieldForm {
  burialSiteContractId: string | number
  contractTypeFieldId: string | number
  fieldValue: string
}

export default async function addOrUpdateBurialSiteContractField(
  fieldForm: BurialSiteContractFieldForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

  const rightNowMillis = Date.now()

  let result = database
    .prepare(
      `update BurialSiteContractFields
        set fieldValue = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = null,
        recordDelete_timeMillis = null
        where burialSiteContractId = ?
        and contractTypeFieldId = ?`
    )
    .run(
      fieldForm.fieldValue,
      user.userName,
      rightNowMillis,
      fieldForm.burialSiteContractId,
      fieldForm.contractTypeFieldId
    )

  if (result.changes === 0) {
    result = database
      .prepare(
        `insert into BurialSiteContractFields (
          burialSiteContractId, contractTypeFieldId, fieldValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        fieldForm.burialSiteContractId,
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
