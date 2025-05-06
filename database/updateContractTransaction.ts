import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

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
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `update ContractTransactions
        set transactionAmount = ?,
          isInvoiced = ?,
          externalReceiptNumber = ?,
          transactionNote = ?,
          transactionDate = ?,
          transactionTime = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId = ?
          and transactionIndex = ?`
    )
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

  database.close()

  return result.changes > 0
}
