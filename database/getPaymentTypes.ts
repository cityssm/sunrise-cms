import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { PaymentType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getPaymentTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): PaymentType[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const shouldUpdateOrderNumbers = !shouldIncludeDeletedRecords

  const paymentTypes = database
    .prepare(
      /* sql */ `
      SELECT
        paymentTypeId,
        paymentType,
        orderNumber
      FROM
        PaymentTypes
        ${
          shouldIncludeDeletedRecords
            ? ''
            : ' WHERE recordDelete_timeMillis IS NULL '
        }
      ORDER BY
        orderNumber,
        paymentType,
        paymentTypeId
    `
    )
    .all() as unknown as PaymentType[]

  if (shouldUpdateOrderNumbers) {
    let expectedOrderNumber = -1

    for (const paymentType of paymentTypes) {
      expectedOrderNumber += 1

      if (paymentType.orderNumber === expectedOrderNumber) {
        continue
      }

      updateRecordOrderNumber(
        'PaymentTypes',
        paymentType.paymentTypeId,
        expectedOrderNumber,
        database
      )

      paymentType.orderNumber = expectedOrderNumber
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return paymentTypes
}
