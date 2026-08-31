import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddBurialSiteTypeForm {
  burialSiteType: string

  bodyCapacityMax: number | string
  crematedCapacityMax: number | string

  orderNumber?: number | string
}

export default function addBurialSiteType(
  form: AddBurialSiteTypeForm,
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
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      form.burialSiteType,
      form.bodyCapacityMax === '' ? undefined : form.bodyCapacityMax,
      form.crematedCapacityMax === ''
        ? undefined
        : form.crematedCapacityMax,
      form.orderNumber ?? -1,
      user.username,
      rightNowMillis,
      user.username,
      rightNowMillis
    )

  if (isAuditLoggingEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          BurialSiteTypes
        WHERE
          burialSiteTypeId = ?
      `)
      .get(result.lastInsertRowid)

    createAuditLogEntries(
      {
        mainRecordId: String(result.lastInsertRowid),
        mainRecordType: 'burialSiteType',
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
