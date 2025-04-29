import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import updateCemeteryDirectionsOfArrival, {
  type UpdateCemeteryDirectionsOfArrivalForm
} from './updateCemeteryDirectionsOfArrival.js'

export type AddCemeteryForm = UpdateCemeteryDirectionsOfArrivalForm & {
  cemeteryDescription: string
  cemeteryKey: string
  cemeteryName: string
  parentCemeteryId: string

  cemeteryLatitude: string
  cemeteryLongitude: string
  cemeterySvg: string

  cemeteryAddress1: string
  cemeteryAddress2: string
  cemeteryCity: string
  cemeteryPostalCode: string
  cemeteryProvince: string

  cemeteryPhoneNumber: string
}

export default function addCemetery(
  addForm: AddCemeteryForm,
  user: User
): number {
  const database = sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into Cemeteries (
        cemeteryName, cemeteryKey, cemeteryDescription,
        cemeterySvg, cemeteryLatitude, cemeteryLongitude,
        cemeteryAddress1, cemeteryAddress2,
        cemeteryCity, cemeteryProvince, cemeteryPostalCode,
        cemeteryPhoneNumber,
        parentCemeteryId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.cemeteryName,
      addForm.cemeteryKey,
      addForm.cemeteryDescription,
      addForm.cemeterySvg,
      addForm.cemeteryLatitude === '' ? undefined : addForm.cemeteryLatitude,
      addForm.cemeteryLongitude === '' ? undefined : addForm.cemeteryLongitude,
      addForm.cemeteryAddress1,
      addForm.cemeteryAddress2,
      addForm.cemeteryCity,
      addForm.cemeteryProvince,
      addForm.cemeteryPostalCode,
      addForm.cemeteryPhoneNumber,
      addForm.parentCemeteryId === '' ? undefined : addForm.parentCemeteryId,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const cemeteryId = result.lastInsertRowid as number

  updateCemeteryDirectionsOfArrival(cemeteryId, addForm, database)

  database.close()

  return cemeteryId
}
