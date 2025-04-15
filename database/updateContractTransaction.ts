import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface ContractTransactionUpdateForm {
  contractId: number | string
  transactionIndex: number | string

  transactionDateString: DateString
  transactionTimeString: TimeString

  externalReceiptNumber: string
  transactionAmount: number | string
  transactionNote: string
}

export default async function updateContractTransaction(
  updateForm: ContractTransactionUpdateForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ContractTransactions
        set transactionAmount = ?,
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
      updateForm.externalReceiptNumber,
      updateForm.transactionNote,
      dateStringToInteger(updateForm.transactionDateString),
      timeStringToInteger(updateForm.transactionTimeString),
      user.userName,
      Date.now(),
      updateForm.contractId,
      updateForm.transactionIndex
    )

  database.release()

  return result.changes > 0
}
