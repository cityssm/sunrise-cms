import {
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface AddTransactionForm {
  burialSiteContractId: string | number
  transactionDateString?: string
  transactionTimeString?: string
  transactionAmount: string | number
  externalReceiptNumber: string
  transactionNote: string
}

export default async function addBurialSiteContractTransaction(
  burialSiteContractTransactionForm: AddTransactionForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  let transactionIndex = 0

  const maxIndexResult = database
    .prepare(
      `select transactionIndex
        from BurialSiteContractTransactions
        where burialSiteContractId = ?
        order by transactionIndex desc
        limit 1`
    )
    .get(burialSiteContractTransactionForm.burialSiteContractId) as
    | { transactionIndex: number }
    | undefined

  if (maxIndexResult !== undefined) {
    transactionIndex = maxIndexResult.transactionIndex + 1
  }

  const rightNow = new Date()

  const transactionDate = burialSiteContractTransactionForm.transactionDateString
    ? dateStringToInteger(burialSiteContractTransactionForm.transactionDateString)
    : dateToInteger(rightNow)

  const transactionTime = burialSiteContractTransactionForm.transactionTimeString
    ? timeStringToInteger(burialSiteContractTransactionForm.transactionTimeString)
    : dateToTimeInteger(rightNow)

  database
    .prepare(
      `insert into BurialSiteContractTransactions (
        burialSiteContractId, transactionIndex,
        transactionDate, transactionTime,
        transactionAmount, externalReceiptNumber, transactionNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      burialSiteContractTransactionForm.burialSiteContractId,
      transactionIndex,
      transactionDate,
      transactionTime,
      burialSiteContractTransactionForm.transactionAmount,
      burialSiteContractTransactionForm.externalReceiptNumber,
      burialSiteContractTransactionForm.transactionNote,
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  database.release()

  return transactionIndex
}
