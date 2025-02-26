import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export interface AddBurialSiteTypeFieldForm {
  burialSiteTypeId: string | number
  burialSiteTypeField: string
  fieldType?: string
  fieldValues?: string
  isRequired?: string
  pattern?: string
  minLength?: string | number
  maxLength?: string | number
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
        minLength, maxLength,
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
      addForm.minLength ?? 0,
      addForm.maxLength ?? 100,
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
