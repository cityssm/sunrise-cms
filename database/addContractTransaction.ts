import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddTransactionForm {
  contractId: number | string

  transactionDateString?: '' | DateString
  transactionTimeString?: '' | TimeString

  isInvoiced?: '0' | '1' | 0 | 1

  externalReceiptNumber: string
  transactionAmount: number | string
  transactionNote: string
}

export default function addContractTransaction(
  contractTransactionForm: AddTransactionForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  let transactionIndex = 0

  const maxIndexResult = database
    .prepare(/* sql */ `select transactionIndex
        from ContractTransactions
        where contractId = ?
        order by transactionIndex desc
        limit 1`
    )
    .get(contractTransactionForm.contractId) as
    | { transactionIndex: number }
    | undefined

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

  database
    .prepare(/* sql */ `insert into ContractTransactions (
        contractId, transactionIndex,
        transactionDate, transactionTime,
        transactionAmount, isInvoiced,
        externalReceiptNumber, transactionNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      contractTransactionForm.contractId,
      transactionIndex,
      transactionDate,
      transactionTime,
      contractTransactionForm.transactionAmount,
      contractTransactionForm.isInvoiced ?? 0,
      contractTransactionForm.externalReceiptNumber,
      contractTransactionForm.transactionNote,
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return transactionIndex
}
