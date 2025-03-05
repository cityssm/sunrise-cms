import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export interface AddForm {
  intermentContainerType: string
  isCremationType?: string
  orderNumber?: number
}

export default async function addIntermentContainerType(
  addForm: AddForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into IntermentContainerTypes (
        intermentContainerType, isCremationType, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      addForm.intermentContainerType,
      addForm.isCremationType === undefined ? 0 : 1,
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.release()

  clearCacheByTableName('IntermentContainerTypes')

  return result.lastInsertRowid as number
}
