import { acquireConnection } from './pool.js'

export interface AddForm {
  funeralHomeName: string
  funeralHomeAddress1: string
  funeralHomeAddress2: string
  funeralHomeCity: string
  funeralHomeProvince: string
  funeralHomePostalCode: string
  funeralHomePhoneNumber: string
}

export default async function addFuneralHome(
  addForm: AddForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into FuneralHomes (
        funeralHomeName, funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.funeralHomeName,
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

  database.release()

  return result.lastInsertRowid as number
}
