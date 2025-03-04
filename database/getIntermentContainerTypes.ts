import type { IntermentContainerType } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getIntermentContainerTypes(): Promise<
  IntermentContainerType[]
> {
  const database = await acquireConnection()

  const containerTypes = database
    .prepare(
      `select intermentContainerTypeId, intermentContainerType, orderNumber
        from IntermentContainerTypes
        where recordDelete_timeMillis is null
        order by orderNumber, intermentContainerType, intermentContainerTypeId`
    )
    .all() as IntermentContainerType[]

  database.release()

  return containerTypes
}
