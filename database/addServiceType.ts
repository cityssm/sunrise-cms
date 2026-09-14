import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface AddForm {
  serviceType: string

  isAvailableOnPortal?: '0' | '1'
  orderNumber?: number | string
}

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export default function addServiceType(
  form: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        ServiceTypes (
          serviceType,
          isAvailableOnPortal,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      form.serviceType,
      form.isAvailableOnPortal ?? '0',
      form.orderNumber ?? -1,
      user.username,
      rightNowMillis,
      user.username,
      rightNowMillis
    )

  const serviceTypeId = result.lastInsertRowid as number

  if (isAuditLoggingEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          ServiceTypes
        WHERE
          serviceTypeId = ?
      `)
      .get(serviceTypeId)

    createAuditLogEntries(
      {
        mainRecordId: serviceTypeId,
        mainRecordType: 'serviceType',
        updateTable: 'ServiceTypes'
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

  clearCacheByTableName('ServiceTypes')

  return serviceTypeId
}
