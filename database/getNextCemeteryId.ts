import { acquireConnection } from './pool.js'

export default async function getNextCemeteryId(
  cemeteryId: number | string
): Promise<number | undefined> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `select cemeteryId
        from Cemeteries
        where recordDelete_timeMillis is null
        and cemeteryName > (select cemeteryName from Cemeteries where cemeteryId = ?)
        order by cemeteryName
        limit 1`
    )
    .pluck()
    .get(cemeteryId) as number | undefined

  database.release()

  return result
}
