import type { PoolConnection } from 'better-sqlite-pool'

import { acquireConnection } from './pool.js'

export interface BurialSiteFieldForm {
  burialSiteId: string | number
  burialSiteTypeFieldId: string | number
  fieldValue: string
}

export default async function addOrUpdateBurialSiteField(
  fieldForm: BurialSiteFieldForm,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<boolean> {
  const database = connectedDatabase ?? (await acquireConnection())

  const rightNowMillis = Date.now()

  let result = database
    .prepare(
      `update BurialSiteFields
        set fieldValue = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = null,
        recordDelete_timeMillis = null
        where burialSiteId = ?
        and burialSiteTypeFieldId = ?`
    )
    .run(
      fieldForm.fieldValue,
      user.userName,
      rightNowMillis,
      fieldForm.burialSiteId,
      fieldForm.burialSiteTypeFieldId
    )

  if (result.changes === 0) {
    result = database
      .prepare(
        `insert into BurialSiteFields (
          burialSiteId, burialSiteTypeFieldId, fieldValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        fieldForm.burialSiteId,
        fieldForm.burialSiteTypeFieldId,
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
