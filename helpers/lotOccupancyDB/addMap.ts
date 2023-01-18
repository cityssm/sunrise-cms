import { acquireConnection } from './pool.js'

import type * as recordTypes from '../../types/recordTypes'

interface AddMapForm {
  mapName: string
  mapDescription: string
  mapSVG: string
  mapLatitude: string
  mapLongitude: string
  mapAddress1: string
  mapAddress2: string
  mapCity: string
  mapProvince: string
  mapPostalCode: string
  mapPhoneNumber: string
}

export async function addMap(
  mapForm: AddMapForm,
  requestSession: recordTypes.PartialSession
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into Maps (
        mapName, mapDescription,
        mapSVG, mapLatitude, mapLongitude,
        mapAddress1, mapAddress2,
        mapCity, mapProvince, mapPostalCode,
        mapPhoneNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      mapForm.mapName,
      mapForm.mapDescription,
      mapForm.mapSVG,
      mapForm.mapLatitude === '' ? undefined : mapForm.mapLatitude,
      mapForm.mapLongitude === '' ? undefined : mapForm.mapLongitude,
      mapForm.mapAddress1,
      mapForm.mapAddress2,
      mapForm.mapCity,
      mapForm.mapProvince,
      mapForm.mapPostalCode,
      mapForm.mapPhoneNumber,
      requestSession.user!.userName,
      rightNowMillis,
      requestSession.user!.userName,
      rightNowMillis
    )

  database.release()

  return result.lastInsertRowid as number
}

export default addMap
