import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface BurialSiteContractTransactionUpdateForm {
  burialSiteContractId: string | number
  transactionIndex: string | number
  transactionDateString: DateString
  transactionTimeString: TimeString
  transactionAmount: string | number
  externalReceiptNumber: string
  transactionNote: string
}

export default async function updateBurialSiteContractTransaction(
  updateForm: BurialSiteContractTransactionUpdateForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update BurialSiteContractTransactions
        set transactionAmount = ?,
        externalReceiptNumber = ?,
        transactionNote = ?,
        transactionDate = ?,
        transactionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
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
      updateForm.burialSiteContractId,
      updateForm.transactionIndex
    )

  database.release()

  return result.changes > 0
}
