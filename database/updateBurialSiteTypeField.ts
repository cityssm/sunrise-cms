import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateBurialSiteTypeFieldForm {
  burialSiteTypeFieldId: number | string

  burialSiteTypeField: string
  isRequired: '0' | '1'

  fieldType?: string
  fieldValues: string

  maxLength?: string
  minLength?: string
  pattern?: string
}

export default function updateBurialSiteTypeField(
  updateForm: UpdateBurialSiteTypeFieldForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSiteTypeFields
      SET
        burialSiteTypeField = ?,
        isRequired = ?,
        fieldType = ?,
        minLength = ?,
        maxLength = ?,
        pattern = ?,
        fieldValues = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteTypeFieldId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.burialSiteTypeField,
      Number.parseInt(updateForm.isRequired, 10),
      updateForm.fieldType ?? 'text',
      updateForm.minLength ?? 0,
      updateForm.maxLength ?? 100,
      updateForm.pattern ?? '',
      updateForm.fieldValues,
      user.userName,
      Date.now(),
      updateForm.burialSiteTypeFieldId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('BurialSiteTypeFields')

  return result.changes > 0
}
