import sqlite from 'better-sqlite3'
import bcrypt from 'bcrypt'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateLocalUserOptions {
  userName: string
  displayName?: string
  password?: string
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
  
  let query = `UPDATE Users SET 
    displayName = ?, isActive = ?,
    canUpdateCemeteries = ?, canUpdateContracts = ?, canUpdateWorkOrders = ?, isAdmin = ?,
    recordUpdate_userName = ?, recordUpdate_timeMillis = ?`
  
  const params = [
    options.displayName || null,
    options.isActive ? 1 : 0,
    options.canUpdateCemeteries ? 1 : 0,
    options.canUpdateContracts ? 1 : 0,
    options.canUpdateWorkOrders ? 1 : 0,
    options.isAdmin ? 1 : 0,
    user.userName,
    rightNowMillis
  ]

  // Only update password if provided
  if (options.password) {
    const passwordHash = bcrypt.hashSync(options.password, 10)
    query += ', passwordHash = ?'
    params.push(passwordHash)
  }

  query += ' WHERE userId = ? AND recordDelete_timeMillis IS NULL'
  params.push(userId)

  const result = database.prepare(query).run(...params)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export default updateLocalUser