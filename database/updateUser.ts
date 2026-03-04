import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'
import getUser from './getUser.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface UpdateUserForm {
  userName: string

  isActive: boolean

  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean

  isAdmin: boolean
}

export default function updateUser(
  updateForm: UpdateUserForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? getUser(updateForm.userName, database)
    : undefined

  const rightNowMillis = Date.now()

  let query = /* sql */ `
    UPDATE Users
    SET
      isActive = ?,
      canUpdateCemeteries = ?,
      canUpdateContracts = ?,
      canUpdateWorkOrders = ?,
      isAdmin = ?,
      recordUpdate_userName = ?,
      recordUpdate_timeMillis = ?
  `

  const parameters = [
    updateForm.isActive ? 1 : 0,
    updateForm.canUpdateCemeteries ? 1 : 0,
    updateForm.canUpdateContracts ? 1 : 0,
    updateForm.canUpdateWorkOrders ? 1 : 0,
    updateForm.isAdmin ? 1 : 0,
    user.userName,
    rightNowMillis
  ]

  query += ' WHERE userName = ? AND recordDelete_timeMillis IS NULL'
  parameters.push(updateForm.userName)

  const result = database.prepare(query).run(...parameters)

  if (auditLogIsEnabled) {
    const recordAfter = getUser(updateForm.userName, database)

    const userDifferences = getObjectDifference(recordBefore, recordAfter)

    if (userDifferences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordType: 'user',
          mainRecordId: updateForm.userName,
          updateTable: 'Users'
        },
        userDifferences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
