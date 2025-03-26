import { acquireConnection } from './pool.js'

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

export default async function updateFuneralHome(
  updateForm: UpdateForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

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
      updateForm.funeralHomePostalCode,
      updateForm.funeralHomePhoneNumber,
      user.userName,
      rightNowMillis,
      updateForm.funeralHomeId
    )

  database.release()

  return result.changes > 0
}
