import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateForm {
  contractId: string | number
  intermentNumber: string | number
  deceasedName: string
  deceasedAddress1: string
  deceasedAddress2: string
  deceasedCity: string
  deceasedProvince: string
  deceasedPostalCode: string
  birthDateString: DateString | ''
  birthPlace: string
  deathDateString: DateString | ''
  deathPlace: string
  intermentContainerTypeId: string | number
}

export default async function updateContractInterment(
  contractForm: UpdateForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const results = database
    .prepare(
      `update ContractInterments
        set deceasedName = ?,
        deceasedAddress1 = ?,
        deceasedAddress2 = ?,
        deceasedCity = ?,
        deceasedProvince = ?,
        deceasedPostalCode = ?,
        birthDate = ?,
        birthPlace = ?,
        deathDate = ?,
        deathPlace = ?,
        intermentContainerTypeId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and contractId = ?
        and intermentNumber = ?`
    )
    .run(
      contractForm.deceasedName,
      contractForm.deceasedAddress1,
      contractForm.deceasedAddress2,
      contractForm.deceasedCity,
      contractForm.deceasedProvince,
      contractForm.deceasedPostalCode,
      contractForm.birthDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.birthDateString),
      contractForm.birthPlace,
      contractForm.deathDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.deathDateString),
      contractForm.deathPlace,
      contractForm.intermentContainerTypeId === ''
        ? undefined
        : contractForm.intermentContainerTypeId,
      user.userName,
      Date.now(),
      contractForm.contractId,
      contractForm.intermentNumber
    )

  database.release()

  return results.changes > 0
}
