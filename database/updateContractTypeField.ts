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

const DEFAULT_MAX_FIELD_LENGTH = 100

// eslint-disable-next-line unicorn/consistent-boolean-name
export default function updateContractTypeField(
  updateForm: UpdateContractTypeFieldForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractTypeFields
      SET
        contractTypeField = ?,
        isRequired = ?,
        fieldType = ?,
        minLength = ?,
        maxLength = ?,
        pattern = ?,
        fieldValues = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractTypeFieldId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.contractTypeField,
      Math.trunc(Number(updateForm.isRequired)),
      updateForm.fieldType ?? 'text',
      updateForm.minLength ?? 0,
      updateForm.maxLength ?? DEFAULT_MAX_FIELD_LENGTH,
      updateForm.pattern ?? '',
      updateForm.fieldValues,
      user.username,
      Date.now(),
      updateForm.contractTypeFieldId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('ContractTypeFields')

  return result.changes > 0
}
