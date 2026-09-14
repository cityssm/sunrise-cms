import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddForm {
  contractType: string
  isPreneed?: string
  isAvailableOnPortal?: '0' | '1'
  orderNumber?: number
}

export default function addContractType(
  form: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        ContractTypes (
          contractType,
          isPreneed,
          isAvailableOnPortal,
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
      form.contractType,
      form.isPreneed === undefined ? 0 : 1,
      form.isAvailableOnPortal ?? '0',
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
          ContractTypes
        WHERE
          contractTypeId = ?
      `)
      .get(result.lastInsertRowid)

    createAuditLogEntries(
      {
        mainRecordId: String(result.lastInsertRowid),
        mainRecordType: 'contractType',
        updateTable: 'ContractTypes'
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

  clearCacheByTableName('ContractTypes')

  return result.lastInsertRowid as number
}
