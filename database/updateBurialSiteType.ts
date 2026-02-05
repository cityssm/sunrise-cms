import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateBurialSiteTypeForm {
  burialSiteTypeId: number | string

  burialSiteType: string

  bodyCapacityMax: number | string
  crematedCapacityMax: number | string
}

export default function updateBurialSiteType(
  updateForm: UpdateBurialSiteTypeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSiteTypes
      SET
        burialSiteType = ?,
        bodyCapacityMax = ?,
        crematedCapacityMax = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
    `)
    .run(
      updateForm.burialSiteType,
      updateForm.bodyCapacityMax === ''
        ? undefined
        : updateForm.bodyCapacityMax,
      updateForm.crematedCapacityMax === ''
        ? undefined
        : updateForm.crematedCapacityMax,

      user.userName,
      rightNowMillis,
      updateForm.burialSiteTypeId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('BurialSiteTypes')

  return result.changes > 0
}
