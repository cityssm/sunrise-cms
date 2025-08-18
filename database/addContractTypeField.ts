import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddContractTypeFieldForm {
  contractTypeId?: number | string

  contractTypeField: string

  fieldType?: string
  fieldValues?: string
  /** '' = not required */
  isRequired?: string
  maxLength?: number | string
  minLength?: number | string
  pattern?: string

  orderNumber?: number
}

export default function addContractTypeField(
  addForm: AddContractTypeFieldForm,
  user: User
): number {
  const database = sqlite(sunriseDB)

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
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      addForm.maxLength ?? 100,
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return result.lastInsertRowid as number
}
