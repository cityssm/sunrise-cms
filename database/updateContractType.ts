import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface UpdateForm {
  contractTypeId: number | string

  contractType: string
  isPreneed?: string

  isAvailableOnPortal?: '0' | '1'
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export default function updateContractType(
  updateForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = isAuditLoggingEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ContractTypes
          WHERE
            contractTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.contractTypeId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractTypes
      SET
        contractType = ?,
        isPreneed = ?,
        isAvailableOnPortal = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId = ?
    `)
    .run(
      updateForm.contractType,
      updateForm.isPreneed === undefined ? 0 : 1,
      updateForm.isAvailableOnPortal ?? '0',
      user.username,
      rightNowMillis,
      updateForm.contractTypeId
    )

  if (isAuditLoggingEnabled && result.changes > 0) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractTypes
        WHERE
          contractTypeId = ?
      `)
      .get(updateForm.contractTypeId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: updateForm.contractTypeId,
          mainRecordType: 'contractType',
          updateTable: 'ContractTypes'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('ContractTypes')

  startSyncDataToPortalTask()

  return result.changes > 0
}
