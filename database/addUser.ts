import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'
import getUser from './getUser.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddLocalUserOptions {
  username: string

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
          username,
          isActive,
          canUpdateCemeteries,
          canUpdateContracts,
          canUpdateWorkOrders,
          isAdmin,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      options.username,
      1,
      options.canUpdateCemeteries ? 1 : 0,
      options.canUpdateContracts ? 1 : 0,
      options.canUpdateWorkOrders ? 1 : 0,
      options.isAdmin ? 1 : 0,
      user.username,
      rightNowMillis,
      user.username,
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
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        username = ?
    `)
    .run(
      1,
      options.canUpdateCemeteries ? 1 : 0,
      options.canUpdateContracts ? 1 : 0,
      options.canUpdateWorkOrders ? 1 : 0,
      options.isAdmin ? 1 : 0,
      user.username,
      rightNowMillis,
      options.username
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
        username = ?
    `)
    .pluck()
    .get(options.username) as number | null | undefined

  let success = false

  if (recordDeleteTimeMillis === undefined) {
    success = insertNewUser(options, user, database)
  } else if (recordDeleteTimeMillis !== null) {
    success = restoreDeletedUser(options, user, database)
  }

  if (success && isAuditLoggingEnabled) {
    const recordAfter = getUser(options.username, database)

    createAuditLogEntries(
      {
        mainRecordId: options.username,
        mainRecordType: 'user',
        updateTable: 'Users'
      },
      [
        {
          property: '*',
          type: 'created',

          from: undefined,
          to: recordAfter
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return success
}
