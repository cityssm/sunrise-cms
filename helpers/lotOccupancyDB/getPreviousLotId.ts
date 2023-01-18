import { acquireConnection } from './pool.js'

import * as configFunctions from '../functions.config.js'

export async function getPreviousLotId(
  lotId: number | string
): Promise<number | undefined> {
  const database = await acquireConnection()

  database.function(
    'userFn_lotNameSortName',
    configFunctions.getProperty('settings.lot.lotNameSortNameFunction')
  )

  const result: {
    lotId: number
  } = database
    .prepare(
      `select lotId from Lots
        where recordDelete_timeMillis is null
        and userFn_lotNameSortName(lotName) < (select userFn_lotNameSortName(lotName) from Lots where lotId = ?)
        order by userFn_lotNameSortName(lotName) desc
        limit 1`
    )
    .get(lotId)

  database.release()

  if (result) {
    return result.lotId
  }

  return undefined
}

export default getPreviousLotId
