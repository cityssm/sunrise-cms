import { acquireConnection } from './pool.js'

// TODO
export default async function getNextBurialSiteId(
  burialSiteId: number | string
): Promise<number | undefined> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `select burialSiteId
        from BurialSites
        where recordDelete_timeMillis is null
        and userFn_lotNameSortName(lotName) > (select userFn_lotNameSortName(lotName) from Lots where lotId = ?)
        order by userFn_lotNameSortName(lotName)
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
