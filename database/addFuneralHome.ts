import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddForm {
  funeralHomeKey: string
  funeralHomeName: string

  funeralHomeAddress1: string
  funeralHomeAddress2: string
  funeralHomeCity: string
  funeralHomePostalCode: string
  funeralHomeProvince: string

  funeralHomePhoneNumber: string
}

export default function addFuneralHome(addForm: AddForm, user: User): number {
  const database = sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into FuneralHomes (
        funeralHomeName, funeralHomeKey, funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.funeralHomeName,
      addForm.funeralHomeKey,
      addForm.funeralHomeAddress1,
      addForm.funeralHomeAddress2,
      addForm.funeralHomeCity,
      addForm.funeralHomeProvince,
      addForm.funeralHomePostalCode,
      addForm.funeralHomePhoneNumber,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.close()

  return result.lastInsertRowid as number
}
