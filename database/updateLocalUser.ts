import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateLocalUserOptions {
  userName: string
  displayName?: string
  canLogin: boolean
  canUpdate: boolean
  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean
  isAdmin: boolean
  isActive: boolean
}

export function updateLocalUser(
  userId: number,
  options: UpdateLocalUserOptions,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()
  
  const query = `UPDATE Users SET 
    displayName = ?, isActive = ?,
    canLogin = ?, canUpdate = ?, canUpdateCemeteries = ?, canUpdateContracts = ?, canUpdateWorkOrders = ?, isAdmin = ?,
    recordUpdate_userName = ?, recordUpdate_timeMillis = ?
    WHERE userId = ? AND recordDelete_timeMillis IS NULL`
  
  const params = [
    options.displayName || null,
    options.isActive ? 1 : 0,
    options.canLogin ? 1 : 0,
    options.canUpdate ? 1 : 0,
    options.canUpdateCemeteries ? 1 : 0,
    options.canUpdateContracts ? 1 : 0,
    options.canUpdateWorkOrders ? 1 : 0,
    options.isAdmin ? 1 : 0,
    user.userName,
    rightNowMillis,
    userId
  ]

  const result = database.prepare(query).run(...params)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export default updateLocalUser