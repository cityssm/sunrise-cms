import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateForm {
  contractId: number | string
  intermentNumber: number | string

  deceasedName: string

  deceasedAddress1: string
  deceasedAddress2: string
  deceasedCity: string
  deceasedPostalCode: string
  deceasedProvince: string

  birthDateString: '' | DateString
  birthPlace: string
  deathDateString: '' | DateString
  deathPlace: string

  deathAge: string
  deathAgePeriod: string
  
  intermentContainerTypeId: number | string
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
        deathAge = ?,
        deathAgePeriod = ?,
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
      contractForm.deathAge,
      contractForm.deathAgePeriod,
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
