import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddContractTypeFieldForm {
  contractTypeId?: number | string

  contractTypeField: string

  fieldType?: string
  fieldValues?: string

  /**
   * '' = not required
   */
  isRequired?: string

  maxLength?: number | string
  minLength?: number | string
  pattern?: string

  orderNumber?: number
}

export default function addContractTypeField(
  form: AddContractTypeFieldForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        ContractTypeFields (
          contractTypeId,
          contractTypeField,
          fieldType,
          fieldValues,
          isRequired,
          pattern,
          minLength,
          maxLength,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      (form.contractTypeId ?? '') === ''
        ? undefined
        : form.contractTypeId,
      form.contractTypeField,
      form.fieldType ?? 'text',
      form.fieldValues ?? '',
      form.isRequired === '' ? 0 : 1,
      form.pattern ?? '',
      form.minLength ?? 0,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      form.maxLength ?? 100,
      form.orderNumber ?? -1,
      user.username,
      rightNowMillis,
      user.username,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypeFields')

  return result.lastInsertRowid as number
}
