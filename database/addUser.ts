import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddLocalUserOptions {
  userName: string

  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean
  isAdmin: boolean
}

function insertNewUser(
  options: AddLocalUserOptions,
  user: User,
  database: sqlite.Database
): boolean {
  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        Users (
          userName,
          isActive,
          canUpdateCemeteries,
          canUpdateContracts,
          canUpdateWorkOrders,
          isAdmin,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      options.userName,
      1,
      options.canUpdateCemeteries ? 1 : 0,
      options.canUpdateContracts ? 1 : 0,
      options.canUpdateWorkOrders ? 1 : 0,
      options.isAdmin ? 1 : 0,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  return result.changes > 0
}

function restoreDeletedUser(
  options: AddLocalUserOptions,
  user: User,
  database: sqlite.Database
): boolean {
  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      UPDATE Users
      SET
        isActive = ?,
        canUpdateCemeteries = ?,
        canUpdateContracts = ?,
        canUpdateWorkOrders = ?,
        isAdmin = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        userName = ?
    `)
    .run(
      1,
      options.canUpdateCemeteries ? 1 : 0,
      options.canUpdateContracts ? 1 : 0,
      options.canUpdateWorkOrders ? 1 : 0,
      options.isAdmin ? 1 : 0,
      user.userName,
      rightNowMillis,
      options.userName
    )

  return result.changes > 0
}

export default function addUser(
  options: AddLocalUserOptions,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  // Check if an user with the same name already exists

  const recordDeleteTimeMillis = database
    .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        Users
      WHERE
        userName = ?
    `)
    .pluck()
    .get(options.userName) as number | null | undefined

  let success = false

  if (recordDeleteTimeMillis === undefined) {
    success = insertNewUser(options, user, database)
  } else if (recordDeleteTimeMillis !== null) {
    success = restoreDeletedUser(options, user, database)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return success
}
