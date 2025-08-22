import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateForm {
  funeralHomeId: number | string
  funeralHomeName: string

  funeralHomeAddress1: string
  funeralHomeAddress2: string
  funeralHomeCity: string
  funeralHomePostalCode: string
  funeralHomeProvince: string

  funeralHomePhoneNumber: string
}

export default function updateFuneralHome(
  updateForm: UpdateForm,
  user: User
, connectedDatabase?: sqlite.Database): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `update FuneralHomes
        set funeralHomeName = ?,
          funeralHomeAddress1 = ?, funeralHomeAddress2 = ?,
          funeralHomeCity = ?, funeralHomeProvince = ?, funeralHomePostalCode = ?,
          funeralHomePhoneNumber = ?,
          recordUpdate_userName = ?, recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and funeralHomeId = ?`
    )
    .run(
      updateForm.funeralHomeName,
      updateForm.funeralHomeAddress1,
      updateForm.funeralHomeAddress2,
      updateForm.funeralHomeCity,
      updateForm.funeralHomeProvince,
      updateForm.funeralHomePostalCode.toUpperCase(),
      updateForm.funeralHomePhoneNumber,
      user.userName,
      rightNowMillis,
      updateForm.funeralHomeId
    )

  if (connectedDatabase === undefined) {


    database.close()


  }
  return result.changes > 0
}
