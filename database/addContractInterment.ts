import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface AddForm {
  contractId: string | number
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
  deathAge: string
  deathAgePeriod: string
  intermentContainerTypeId: string | number
}

export default async function addContractInterment(
  contractForm: AddForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const maxIntermentNumber = (database
    .prepare(
      `select max(intermentNumber) as maxIntermentNumber
      from ContractInterments
      where contractId = ?`
    )
    .pluck()
    .get(contractForm.contractId) ?? 0) as number

  const newIntermentNumber = maxIntermentNumber + 1
  const rightNowMillis = Date.now()

  database
    .prepare(
      `insert into ContractInterments
        (contractId, intermentNumber,
          deceasedName, deceasedAddress1, deceasedAddress2, deceasedCity, deceasedProvince, deceasedPostalCode,
          birthDate, birthPlace, deathDate, deathPlace, intermentContainerTypeId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      contractForm.contractId,
      newIntermentNumber,
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
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.release()

  return newIntermentNumber
}
