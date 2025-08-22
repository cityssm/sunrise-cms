import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface LocalUser {
  userId: number
  userName: string
  displayName?: string
  isActive: boolean
  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean
  isAdmin: boolean
  recordCreate_userName: string
  recordCreate_timeMillis: number
  recordUpdate_userName: string
  recordUpdate_timeMillis: number
}

export function getLocalUsers(
  connectedDatabase?: sqlite.Database
): LocalUser[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const users = database
    .prepare(
      `SELECT userId, userName, displayName, isActive,
              canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
              recordCreate_userName, recordCreate_timeMillis,
              recordUpdate_userName, recordUpdate_timeMillis
       FROM Users
       WHERE recordDelete_timeMillis IS NULL
       ORDER BY userName`
    )
    .all() as LocalUser[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return users
}

export function getLocalUser(
  userName: string,
  connectedDatabase?: sqlite.Database
): LocalUser | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const user = database
    .prepare(
      `SELECT userId, userName, displayName, isActive,
              canUpdateCemeteries, canUpdateContracts, canUpdateWorkOrders, isAdmin,
              recordCreate_userName, recordCreate_timeMillis,
              recordUpdate_userName, recordUpdate_timeMillis
       FROM Users
       WHERE userName = ? AND recordDelete_timeMillis IS NULL`
    )
    .get(userName) as LocalUser | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return user
}

export default getLocalUsers