import type { Fee } from '../types/recordTypes.js'

import getFee from './getFee.js'
import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export async function moveFeeDown(feeId: number | string): Promise<boolean> {
  const database = await acquireConnection()

  const currentFee = (await getFee(feeId, database)) as Fee

  database
    .prepare(
      `update Fees
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
          and feeCategoryId = ?
          and orderNumber = ? + 1`
    )
    .run(currentFee.feeCategoryId, currentFee.orderNumber)

  const success = updateRecordOrderNumber(
    'Fees',
    feeId,
    currentFee.orderNumber + 1,
    database
  )

  database.release()

  return success
}

export async function moveFeeDownToBottom(
  feeId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentFee = (await getFee(feeId, database)) as Fee

  const maxOrderNumber = (
    database
      .prepare(
        `select max(orderNumber) as maxOrderNumber
          from Fees
          where recordDelete_timeMillis is null
          and feeCategoryId = ?`
      )
      .get(currentFee.feeCategoryId) as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentFee.orderNumber !== maxOrderNumber) {
    updateRecordOrderNumber('Fees', feeId, maxOrderNumber + 1, database)

    database
      .prepare(
        `update Fees
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
            and feeCategoryId = ? and orderNumber > ?`
      )
      .run(currentFee.feeCategoryId, currentFee.orderNumber)
  }

  database.release()

  return true
}

export async function moveFeeUp(feeId: number | string): Promise<boolean> {
  const database = await acquireConnection()

  const currentFee = (await getFee(feeId, database)) as Fee

  if (currentFee.orderNumber <= 0) {
    database.release()
    return true
  }

  database
    .prepare(
      `update Fees
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
          and feeCategoryId = ?
          and orderNumber = ? - 1`
    )
    .run(currentFee.feeCategoryId, currentFee.orderNumber)

  const success = updateRecordOrderNumber(
    'Fees',
    feeId,
    currentFee.orderNumber - 1,
    database
  )

  database.release()

  return success
}

export async function moveFeeUpToTop(feeId: number | string): Promise<boolean> {
  const database = await acquireConnection()

  const currentFee = (await getFee(feeId, database)) as Fee

  if (currentFee.orderNumber > 0) {
    updateRecordOrderNumber('Fees', feeId, -1, database)

    database
      .prepare(
        `update Fees
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
            and feeCategoryId = ?
            and orderNumber < ?`
      )
      .run(currentFee.feeCategoryId, currentFee.orderNumber)
  }

  database.release()

  return true
}

export default moveFeeUp
