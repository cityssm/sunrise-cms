import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddForm {
  contractId: number | string

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

  deathAge: number | string
  deathAgePeriod: string

  intermentContainerTypeId: number | string
}

export default function addContractInterment(
  contractForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return newIntermentNumber
}
