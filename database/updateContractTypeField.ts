import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export interface UpdateContractTypeFieldForm {
  contractTypeFieldId: number | string
  contractTypeField: string
  isRequired: '0' | '1'
  fieldType?: string
  minimumLength?: string
  maximumLength?: string
  pattern?: string
  fieldValues: string
}

export default async function updateContractTypeField(
  updateForm: UpdateContractTypeFieldForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ContractTypeFields
        set contractTypeField = ?,
        isRequired = ?,
        fieldType = ?,
        minimumLength = ?,
        maximumLength = ?,
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
      updateForm.minimumLength ?? 0,
      updateForm.maximumLength ?? 100,
      updateForm.pattern ?? '',
      updateForm.fieldValues,
      user.userName,
      Date.now(),
      updateForm.contractTypeFieldId
    )

  database.release()

  clearCacheByTableName('ContractTypeFields')

  return result.changes > 0
}
