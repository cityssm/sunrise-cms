import {
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface AddLotOccupancyTransactionForm {
  burialSiteContractId: string | number
  transactionDateString?: string
  transactionTimeString?: string
  transactionAmount: string | number
  externalReceiptNumber: string
  transactionNote: string
}

export default async function addLotOccupancyTransaction(
  lotOccupancyTransactionForm: AddLotOccupancyTransactionForm,
  user: User
): Promise<number> {
  const database = await acquireConnection()

  let transactionIndex = 0

  const maxIndexResult = database
    .prepare(
      `select transactionIndex
        from LotOccupancyTransactions
        where burialSiteContractId = ?
        order by transactionIndex desc
        limit 1`
    )
    .get(lotOccupancyTransactionForm.burialSiteContractId) as
    | { transactionIndex: number }
    | undefined

  if (maxIndexResult !== undefined) {
    transactionIndex = maxIndexResult.transactionIndex + 1
  }

  const rightNow = new Date()

  const transactionDate = lotOccupancyTransactionForm.transactionDateString
    ? dateStringToInteger(lotOccupancyTransactionForm.transactionDateString)
    : dateToInteger(rightNow)

  const transactionTime = lotOccupancyTransactionForm.transactionTimeString
    ? timeStringToInteger(lotOccupancyTransactionForm.transactionTimeString)
    : dateToTimeInteger(rightNow)

  database
    .prepare(
      `insert into LotOccupancyTransactions (
        burialSiteContractId, transactionIndex,
        transactionDate, transactionTime,
        transactionAmount, externalReceiptNumber, transactionNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      lotOccupancyTransactionForm.burialSiteContractId,
      transactionIndex,
      transactionDate,
      transactionTime,
      lotOccupancyTransactionForm.transactionAmount,
      lotOccupancyTransactionForm.externalReceiptNumber,
      lotOccupancyTransactionForm.transactionNote,
      user.userName,
      rightNow.getTime(),
      user.userName,
      rightNow.getTime()
    )

  database.release()

  return transactionIndex
}
