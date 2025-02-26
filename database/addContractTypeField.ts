import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export interface AddContractTypeFieldForm {
  contractTypeId?: string | number
  contractTypeField: string
  fieldValues?: string
  fieldType?: string
  isRequired?: string
  pattern?: string
  minLength?: string | number
  maxLength?: string | number
  orderNumber?: number
}

export default async function addContractTypeField(
  addForm: AddContractTypeFieldForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into ContractTypeFields (
        contractTypeId, contractTypeField, fieldType,
        fieldValues, isRequired, pattern,
        minLength, maxLength,
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.contractTypeId ?? undefined,
      addForm.contractTypeField,
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

  clearCacheByTableName('ContractTypeFields')

  return result.lastInsertRowid as number
}
