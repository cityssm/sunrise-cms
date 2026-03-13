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

  let insertResult: sqlite.RunResult

  const existingRecord = database
    .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        ContractServiceTypes
      WHERE
        contractId = ?
        AND serviceTypeId = ?
    `)
    .get(addForm.contractId, addForm.serviceTypeId) as
    | { recordDelete_timeMillis?: number }
    | undefined

  if (
    existingRecord !== undefined &&
    existingRecord.recordDelete_timeMillis === undefined
  ) {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return false
  }

  // eslint-disable-next-line unicorn/prefer-ternary
  if (existingRecord === undefined) {
    insertResult = database
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
  } else {
    insertResult = database
      .prepare(/* sql */ `
        UPDATE ContractServiceTypes
        SET
          contractServiceDetails = ?,
          recordDelete_userName = NULL,
          recordDelete_timeMillis = NULL,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        WHERE
          contractId = ?
          AND serviceTypeId = ?
      `)
      .run(
        addForm.contractServiceDetails ?? '',
        user.userName,
        rightNowMillis,
        addForm.contractId,
        addForm.serviceTypeId
      )
  }

  if (insertResult.changes > 0 && auditLogIsEnabled) {
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
        mainRecordId: addForm.contractId,
        mainRecordType: 'contract',
        recordIndex: addForm.serviceTypeId,
        updateTable: 'ContractServiceTypes'
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

  return insertResult.changes > 0
}
