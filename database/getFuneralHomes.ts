import type { Cemetery, FuneralHome } from '../types/record.types.js'

import { acquireConnection } from './pool.js'

export default async function getFuneralHomes(): Promise<FuneralHome[]> {
  const database = await acquireConnection()

  const funeralHomes = database
    .prepare(
      `select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        order by f.funeralHomeName, f.funeralHomeId`
    )
    .all() as Cemetery[]

  database.release()

  return funeralHomes
}
