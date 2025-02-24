import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export interface UpdateBurialSiteTypeFieldForm {
  burialSiteTypeFieldId: number | string
  burialSiteTypeField: string
  isRequired: '0' | '1'
  fieldType?: string
  minimumLength?: string
  maximumLength?: string
  pattern?: string
  fieldValues: string
}

export default async function updateBurialSiteTypeField(
  updateForm: UpdateBurialSiteTypeFieldForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update BurialSiteTypeFields
        set burialSiteTypeField = ?,
        isRequired = ?,
        fieldType = ?,
        minimumLength = ?,
        maximumLength = ?,
        pattern = ?,
        fieldValues = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where burialSiteTypeFieldId = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      updateForm.burialSiteTypeField,
      Number.parseInt(updateForm.isRequired, 10),
      updateForm.fieldType ?? 'text',
      updateForm.minimumLength ?? 0,
      updateForm.maximumLength ?? 100,
      updateForm.pattern ?? '',
      updateForm.fieldValues,
      user.userName,
      Date.now(),
      updateForm.burialSiteTypeFieldId
    )

  database.release()

  clearCacheByTableName('BurialSiteTypeFields')

  return result.changes > 0
}
