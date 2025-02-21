import { getConfigProperty } from '../helpers/config.helpers.js'

import { acquireConnection } from './pool.js'

export default async function getPreviousLotId(
  lotId: number | string
): Promise<number | undefined> {
  const database = await acquireConnection()

  database.function(
    'userFn_lotNameSortName',
    getConfigProperty('settings.lot.lotNameSortNameFunction')
  )

  const result = database
    .prepare(
      `select lotId from Lots
        where recordDelete_timeMillis is null
        and userFn_lotNameSortName(lotName) < (select userFn_lotNameSortName(lotName) from Lots where lotId = ?)
        order by userFn_lotNameSortName(lotName) desc
        limit 1`
    )
    .get(lotId) as
    | {
        lotId: number
      }
    | undefined

  database.release()

  if (result === undefined) {
    return undefined
  }

  return result.lotId
}
