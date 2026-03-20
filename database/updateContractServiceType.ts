import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface UpdateForm {
  contractId: number | string
  serviceTypeId: number | string

  contractServiceDetails?: string
}

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function updateContractServiceType(
  updateForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ContractServiceTypes
          WHERE
            contractId = ?
            AND serviceTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.contractId, updateForm.serviceTypeId)
    : undefined

  const info = database
    .prepare(/* sql */ `
      UPDATE ContractServiceTypes
      SET
        contractServiceDetails = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractId = ?
        AND serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.contractServiceDetails ?? '',
      user.userName,
      Date.now(),
      updateForm.contractId,
      updateForm.serviceTypeId
    )

  if (info.changes > 0 && auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractServiceTypes
        WHERE
          contractId = ?
          AND serviceTypeId = ?
      `)
      .get(updateForm.contractId, updateForm.serviceTypeId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: updateForm.contractId,
          mainRecordType: 'contract',
          recordIndex: updateForm.serviceTypeId,
          updateTable: 'ContractServiceTypes'
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

  return info.changes > 0
}
