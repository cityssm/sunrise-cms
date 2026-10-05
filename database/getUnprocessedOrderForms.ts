import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { OrderForm } from '../types/record.types.js'

export default function getUnprocessedOrderForms(): OrderForm[] {
  const database = new DatabaseSync(sunriseDB)

  const rows = database
    .prepare(/* sql */ `
      SELECT
        orderFormId,
        orderFormKey,
        orderFormData AS orderFormDataString,
        recordCreate_ipAddress,
        recordCreate_timeMillis,
        recordSync_timeMillis,
        isOrderFormProcessed
      FROM
        OrderForms
      WHERE
        recordDelete_timeMillis IS NULL
        AND isOrderFormProcessed = 0
    `)
    .all() as Array<
    Omit<OrderForm, 'orderFormData'> & { orderFormDataString: string }
  >

  database.close()

  return rows.map(({ orderFormDataString, ...rest }) => ({
    ...rest,

    orderFormData: JSON.parse(orderFormDataString) as OrderForm['orderFormData']
  })) as OrderForm[]
}

export function getUnprocessedOrderFormCount(): number {
  const database = new DatabaseSync(sunriseDB)

  const row = database
    .prepare(/* sql */ `
      SELECT
        COUNT(*) AS count
      FROM
        OrderForms
      WHERE
        recordDelete_timeMillis IS NULL
        AND isOrderFormProcessed = 0
    `)
    .get() as { count: number } | undefined

  database.close()

  return row?.count ?? 0
}
