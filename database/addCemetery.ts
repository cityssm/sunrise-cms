import { acquireConnection } from './pool.js'

export interface AddCemeteryForm {
  cemeteryName: string
  cemeteryDescription: string

  cemeterySvg: string
  cemeteryLatitude: string
  cemeteryLongitude: string

  cemeteryAddress1: string
  cemeteryAddress2: string
  cemeteryCity: string
  cemeteryProvince: string
  cemeteryPostalCode: string
  cemeteryPhoneNumber: string
}

export default async function addCemetery(
  addForm: AddCemeteryForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into Cemeteries (
        cemeteryName, cemeteryDescription,
        cemeterySvg, cemeteryLatitude, cemeteryLongitude,
        cemeteryAddress1, cemeteryAddress2,
        cemeteryCity, cemeteryProvince, cemeteryPostalCode,
        cemeteryPhoneNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.cemeteryName,
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
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.release()

  return result.lastInsertRowid as number
}
