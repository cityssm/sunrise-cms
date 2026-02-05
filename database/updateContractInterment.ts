import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

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

export default function updateContractInterment(
  contractForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const results = database
    .prepare(/* sql */ `
      UPDATE ContractInterments
      SET
        deceasedName = ?,
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
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND intermentNumber = ?
    `)
    .run(
      contractForm.deceasedName,
      contractForm.deceasedAddress1,
      contractForm.deceasedAddress2,
      contractForm.deceasedCity,
      contractForm.deceasedProvince,
      contractForm.deceasedPostalCode.toUpperCase(),
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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return results.changes > 0
}
