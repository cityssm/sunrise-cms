import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddForm {
  contractId: number | string
  serviceTypeId: number | string
  contractServiceDetails?: string
}

export default function addContractServiceType(
  addForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  try {
    const result = database
      .prepare(/* sql */ `
        INSERT INTO
          ContractServiceTypes (
            contractId,
            serviceTypeId,
            contractServiceDetails,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        addForm.contractId,
        addForm.serviceTypeId,
        addForm.contractServiceDetails ?? '',
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )

    if (result.changes > 0 && auditLogIsEnabled) {
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
        .get(addForm.contractId, addForm.serviceTypeId)

      createAuditLogEntries(
        {
          mainRecordType: 'contract',
          mainRecordId: addForm.contractId,
          updateTable: 'ContractServiceTypes',
          recordIndex: addForm.serviceTypeId
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

    return result.changes > 0
  } catch {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return false
  }
}
