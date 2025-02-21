import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export interface AddBurialSiteTypeFieldForm {
  burialSiteTypeId: string | number
  burialSiteTypeField: string
  fieldType?: string
  fieldValues?: string
  isRequired?: string
  pattern?: string
  minimumLength?: string | number
  maximumLength?: string | number
  orderNumber?: number
}

export default async function addBurialSiteTypeField(
  addForm: AddBurialSiteTypeFieldForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into BurialSiteTypeFields (
        burialSiteTypeId, burialSiteTypeField,
        fieldType, fieldValues,
        isRequired, pattern,
        minimumLength, maximumLength,
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.burialSiteTypeId,
      addForm.burialSiteTypeField,
      addForm.fieldType ?? 'text',
      addForm.fieldValues ?? '',
      addForm.isRequired === '' ? 0 : 1,
      addForm.pattern ?? '',
      addForm.minimumLength ?? 0,
      addForm.maximumLength ?? 100,
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.release()

  clearCacheByTableName('BurialSiteTypeFields')

  return result.lastInsertRowid as number
}
