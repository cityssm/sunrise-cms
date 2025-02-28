import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'

import addOrUpdateContractField from './addOrUpdateContractField.js'
import deleteContractField from './deleteContractField.js'
import { acquireConnection } from './pool.js'

export interface UpdateContractForm {
  contractId: string | number
  contractTypeId: string | number
  burialSiteId: string | number

  contractStartDateString: DateString
  contractEndDateString: DateString | ''

  contractTypeFieldIds?: string
  [fieldValue_contractTypeFieldId: string]: unknown
}

export default async function updateContract(
  updateForm: UpdateContractForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update Contracts
        set contractTypeId = ?,
        burialSiteId = ?,
        contractStartDate = ?,
        contractEndDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where contractId = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      updateForm.contractTypeId,
      updateForm.burialSiteId === '' ? undefined : updateForm.burialSiteId,
      dateStringToInteger(updateForm.contractStartDateString),
      updateForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(updateForm.contractEndDateString),
      user.userName,
      Date.now(),
      updateForm.contractId
    )

  if (result.changes > 0) {
    const contractTypeFieldIds = (
      updateForm.contractTypeFieldIds ?? ''
    ).split(',')

    for (const contractTypeFieldId of contractTypeFieldIds) {
      const fieldValue = updateForm[
        `fieldValue_${contractTypeFieldId}`
      ] as string

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      await ((fieldValue ?? '') === ''
        ? deleteContractField(
            updateForm.contractId,
            contractTypeFieldId,
            user,
            database
          )
        : addOrUpdateContractField(
            {
              contractId: updateForm.contractId,
              contractTypeFieldId,
              fieldValue
            },
            user,
            database
          ))
    }
  }

  database.release()

  return result.changes > 0
}
