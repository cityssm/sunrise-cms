import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import updateCemeteryDirectionsOfArrival, {
  type UpdateCemeteryDirectionsOfArrivalForm
} from './updateCemeteryDirectionsOfArrival.js'

export type UpdateCemeteryForm = UpdateCemeteryDirectionsOfArrivalForm & {
  cemeteryId: string

  cemeteryDescription: string
  cemeteryKey: string
  cemeteryName: string
  parentCemeteryId: string

  cemeteryAddress1: string
  cemeteryAddress2: string
  cemeteryCity: string
  cemeteryPostalCode: string
  cemeteryProvince: string

  cemeteryPhoneNumber: string

  cemeteryLatitude: string
  cemeteryLongitude: string
  cemeterySvg: string
}

/**
 * Updates a cemetery in the database.
 * Be sure to rebuild burial site names after updating a cemetery.
 * @param updateForm - The form data from the update cemetery form.
 * @param user - The user who is updating the cemetery.
 * @returns `true` if the cemetery was updated successfully, `false` otherwise.
 */
export default function updateCemetery(
  updateForm: UpdateCemeteryForm,
  user: User
, connectedDatabase?: sqlite.Database): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(
      `update Cemeteries
        set cemeteryName = ?,
        cemeteryKey = ?,
        cemeteryDescription = ?,
        cemeterySvg = ?,
        cemeteryLatitude = ?,
        cemeteryLongitude = ?,
        cemeteryAddress1 = ?,
        cemeteryAddress2 = ?,
        cemeteryCity = ?,
        cemeteryProvince = ?,
        cemeteryPostalCode = ?,
        cemeteryPhoneNumber = ?,
        parentCemeteryId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      updateForm.cemeteryName,
      updateForm.cemeteryKey,
      updateForm.cemeteryDescription,
      updateForm.cemeterySvg,
      updateForm.cemeteryLatitude === ''
        ? undefined
        : updateForm.cemeteryLatitude,
      updateForm.cemeteryLongitude === ''
        ? undefined
        : updateForm.cemeteryLongitude,
      updateForm.cemeteryAddress1,
      updateForm.cemeteryAddress2,
      updateForm.cemeteryCity,
      updateForm.cemeteryProvince,
      updateForm.cemeteryPostalCode.toUpperCase(),
      updateForm.cemeteryPhoneNumber,
      updateForm.parentCemeteryId === ''
        ? undefined
        : updateForm.parentCemeteryId,
      user.userName,
      Date.now(),
      updateForm.cemeteryId
    )

  updateCemeteryDirectionsOfArrival(updateForm.cemeteryId, updateForm, database)

  if (connectedDatabase === undefined) {


    database.close()


  }
  return result.changes > 0
}
