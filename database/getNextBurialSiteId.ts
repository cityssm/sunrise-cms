import { acquireConnection } from './pool.js'

export default async function getNextBurialSiteId(
  burialSiteId: number | string
): Promise<number | undefined> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `select burialSiteId
        from BurialSites
        where recordDelete_timeMillis is null
        and burialSiteName > (select burialSiteName from BurialSites where burialSiteId = ?)
        order by burialSiteName
        limit 1`
    )
    .pluck()
    .get(burialSiteId) as number | undefined

  database.release()

  if (result === undefined) {
    return undefined
  }

  return result
}
