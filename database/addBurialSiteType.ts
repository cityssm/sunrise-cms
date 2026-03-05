import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddBurialSiteTypeForm {
  burialSiteType: string

  bodyCapacityMax: number | string
  crematedCapacityMax: number | string

  orderNumber?: number | string
}

export default function addBurialSiteType(
  addForm: AddBurialSiteTypeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        BurialSiteTypes (
          burialSiteType,
          bodyCapacityMax,
          crematedCapacityMax,
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
      addForm.burialSiteType,
      addForm.bodyCapacityMax === '' ? undefined : addForm.bodyCapacityMax,
      addForm.crematedCapacityMax === ''
        ? undefined
        : addForm.crematedCapacityMax,
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (auditLogIsEnabled) {
    const recordAfter = database
      .prepare(
        /* sql */ `SELECT * FROM BurialSiteTypes WHERE burialSiteTypeId = ?`
      )
      .get(result.lastInsertRowid)

    createAuditLogEntries(
      {
        mainRecordType: 'burialSiteType',
        mainRecordId: String(result.lastInsertRowid),
        updateTable: 'BurialSiteTypes'
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
  clearCacheByTableName('BurialSiteTypes')

  return result.lastInsertRowid as number
}
