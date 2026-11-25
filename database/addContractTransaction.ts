import type { DatabaseSync } from 'node:sqlite'

import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { isAuditLoggingEnabled } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface AddTransactionForm {
  contractId: number | string

  transactionDateString?: '' | DateString
  transactionTimeString?: '' | TimeString

  paymentTypeId?: number | string

  externalReceiptNumber: string
  transactionAmount: number | string
  transactionNote: string
}

export default function addContractTransaction(
  contractTransactionForm: AddTransactionForm,
  user: User,
  connectedDatabase?: DatabaseSync
): number {
  const database = connectedDatabase ?? getDatabaseConnection()

  let transactionIndex = 0

  const maxIndexResult = database
    .prepare(/* sql */ `
      SELECT
        transactionIndex
      FROM
        ContractTransactions
      WHERE
        contractId = ?
      ORDER BY
        transactionIndex DESC
      LIMIT
        1
    `)
    .get(contractTransactionForm.contractId) as
    { transactionIndex: number } | undefined

  if (maxIndexResult !== undefined) {
    transactionIndex = maxIndexResult.transactionIndex + 1
  }

  const rightNow = new Date()

  const transactionDate =
    (contractTransactionForm.transactionDateString ?? '') === ''
      ? dateToInteger(rightNow)
      : dateStringToInteger(
          contractTransactionForm.transactionDateString as DateString
        )

  const transactionTime =
    (contractTransactionForm.transactionTimeString ?? '') === ''
      ? dateToTimeInteger(rightNow)
      : timeStringToInteger(
          contractTransactionForm.transactionTimeString as TimeString
        )

  const paymentTypeId =
    contractTransactionForm.paymentTypeId === '' ||
    contractTransactionForm.paymentTypeId === undefined
      ? (
          database
            .prepare(/* sql */ `
              SELECT
                paymentTypeId
              FROM
                PaymentTypes
              WHERE
                recordDelete_timeMillis IS NULL
              ORDER BY
                orderNumber,
                paymentType
              LIMIT
                1
            `)
            .get() as { paymentTypeId: number }
        ).paymentTypeId
      : contractTransactionForm.paymentTypeId

  database
    .prepare(/* sql */ `
      INSERT INTO
        ContractTransactions (
          contractId,
          transactionIndex,
          transactionDate,
          transactionTime,
          transactionAmount,
          paymentTypeId,
          externalReceiptNumber,
          transactionNote,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      contractTransactionForm.contractId,
      transactionIndex,
      transactionDate,
      transactionTime ?? 0,
      contractTransactionForm.transactionAmount,
      paymentTypeId,
      contractTransactionForm.externalReceiptNumber,
      contractTransactionForm.transactionNote,
      user.username,
      rightNow.getTime(),
      user.username,
      rightNow.getTime()
    )

  if (isAuditLoggingEnabled) {
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
      .get(contractTransactionForm.contractId, transactionIndex)

    createAuditLogEntries(
      {
        mainRecordId: contractTransactionForm.contractId,
        mainRecordType: 'contract',
        recordIndex: transactionIndex,
        updateTable: 'ContractTransactions'
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

  return transactionIndex
}
