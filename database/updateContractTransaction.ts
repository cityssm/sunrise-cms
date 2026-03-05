import getObjectDifference from '@cityssm/object-difference'
import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface ContractTransactionUpdateForm {
  contractId: number | string
  transactionIndex: number | string

  transactionDateString: DateString
  transactionTimeString: TimeString

  isInvoiced?: '0' | '1' | 0 | 1

  externalReceiptNumber: string
  transactionAmount: number | string
  transactionNote: string
}

export default function updateContractTransaction(
  updateForm: ContractTransactionUpdateForm,
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
            ContractTransactions
          WHERE
            contractId = ?
            AND transactionIndex = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.contractId, updateForm.transactionIndex)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractTransactions
      SET
        transactionAmount = ?,
        isInvoiced = ?,
        externalReceiptNumber = ?,
        transactionNote = ?,
        transactionDate = ?,
        transactionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND transactionIndex = ?
    `)
    .run(
      updateForm.transactionAmount,
      updateForm.isInvoiced ?? 0,
      updateForm.externalReceiptNumber,
      updateForm.transactionNote,
      dateStringToInteger(updateForm.transactionDateString),
      timeStringToInteger(updateForm.transactionTimeString),
      user.userName,
      Date.now(),
      updateForm.contractId,
      updateForm.transactionIndex
    )

  if (result.changes > 0 && auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractTransactions
        WHERE
          contractId = ?
          AND transactionIndex = ?
      `)
      .get(updateForm.contractId, updateForm.transactionIndex)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordType: 'contract',
          mainRecordId: updateForm.contractId,
          updateTable: 'ContractTransactions',
          recordIndex: updateForm.transactionIndex
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
  return result.changes > 0
}
