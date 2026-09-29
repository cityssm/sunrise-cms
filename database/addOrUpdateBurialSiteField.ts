import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface BurialSiteFieldForm {
  burialSiteId: number | string
  burialSiteTypeFieldId: number | string
  fieldValue: string
}

export default function addOrUpdateBurialSiteField(
  fieldForm: BurialSiteFieldForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const rightNowMillis = Date.now()

  let result = database
    .prepare(/* sql */ `
      UPDATE BurialSiteFields
      SET
        fieldValue = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        burialSiteId = ?
        AND burialSiteTypeFieldId = ?
    `)
    .run(
      fieldForm.fieldValue,
      user.username,
      rightNowMillis,
      fieldForm.burialSiteId,
      fieldForm.burialSiteTypeFieldId
    )

  if (result.changes === 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          BurialSiteFields (
            burialSiteId,
            burialSiteTypeFieldId,
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
        fieldForm.burialSiteId,
        fieldForm.burialSiteTypeFieldId,
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
