import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface AddIntermentContainerTypeForm {
  intermentContainerType: string
  intermentContainerTypeKey?: string
  isCremationType?: '0' | '1'
  orderNumber?: number | string
}

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function addIntermentContainerType(
  addForm: AddIntermentContainerTypeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        IntermentContainerTypes (
          intermentContainerType,
          intermentContainerTypeKey,
          isCremationType,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      addForm.intermentContainerType,
      addForm.intermentContainerTypeKey ?? '',
      addForm.isCremationType ?? '0',
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const intermentContainerTypeId = result.lastInsertRowid as number

  if (auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          IntermentContainerTypes
        WHERE
          intermentContainerTypeId = ?
      `)
      .get(intermentContainerTypeId)

    createAuditLogEntries(
      {
        mainRecordId: intermentContainerTypeId,
        mainRecordType: 'intermentContainerType',
        updateTable: 'IntermentContainerTypes'
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

  clearCacheByTableName('IntermentContainerTypes')

  return intermentContainerTypeId
}
