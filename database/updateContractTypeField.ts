import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateContractTypeFieldForm {
  contractTypeFieldId: number | string

  contractTypeField: string
  fieldType?: string
  fieldValues: string
  isRequired: '0' | '1'
  maxLength?: string
  minLength?: string
  pattern?: string
}

export default function updateContractTypeField(
  updateForm: UpdateContractTypeFieldForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(
      `update ContractTypeFields
        set contractTypeField = ?,
          isRequired = ?,
          fieldType = ?,
          minLength = ?,
          maxLength = ?,
          pattern = ?,
          fieldValues = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where contractTypeFieldId = ?
          and recordDelete_timeMillis is null`
    )
    .run(
      updateForm.contractTypeField,
      Number.parseInt(updateForm.isRequired, 10),
      updateForm.fieldType ?? 'text',
      updateForm.minLength ?? 0,
      updateForm.maxLength ?? 100,
      updateForm.pattern ?? '',
      updateForm.fieldValues,
      user.userName,
      Date.now(),
      updateForm.contractTypeFieldId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  clearCacheByTableName('ContractTypeFields')

  return result.changes > 0
}
