import { DatabaseSync } from 'node:sqlite'

import type { UnprocessedOrderForm } from 'sunrise-cms-shared'

import { sunriseDB } from '../../../helpers/database.helpers.js'

export default function recordOrderForm(
  orderForm: UnprocessedOrderForm
): number {
  const database = new DatabaseSync(sunriseDB)

  let recordSyncTimeMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      SELECT
        recordSync_timeMillis
      FROM
        OrderForms
      WHERE
        orderFormKey = ?
    `)
    .get(orderForm.orderFormKey) as
    { recordSync_timeMillis: number } | undefined

  if (result === undefined) {
    database
      .prepare(/* sql */ `
        INSERT INTO
          OrderForms (
            orderFormId,
            orderFormKey,
            orderFormData,
            recordCreate_ipAddress,
            recordCreate_timeMillis,
            recordSync_timeMillis,
            isOrderFormProcessed
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        orderForm.orderFormId,
        orderForm.orderFormKey,
        JSON.stringify(orderForm.orderFormData),
        orderForm.recordCreate_ipAddress,
        orderForm.recordCreate_timeMillis,
        recordSyncTimeMillis,
        0
      )
  } else {
    recordSyncTimeMillis = result.recordSync_timeMillis
  }

  database.close()

  return recordSyncTimeMillis
}
