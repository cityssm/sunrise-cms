import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { OrderForm } from '../types/record.types.js'

export interface GetOrderFormsFilters {
  isOrderFormProcessed?: boolean
}

export default function getOrderForms(
  filters: GetOrderFormsFilters
): OrderForm[] {
  let sql = /* sql */ `
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
  `

  let sqlParameters = {}

  if (filters.isOrderFormProcessed !== undefined) {
    sql += ' AND isOrderFormProcessed = @isOrderFormProcessed'
    sqlParameters = {
      isOrderFormProcessed: filters.isOrderFormProcessed ? 1 : 0
    }
  }

  sql += ' ORDER BY orderFormId DESC'

  const database = getDatabaseConnection(true)

  const rows = database.prepare(sql).all(sqlParameters) as Array<
    Omit<OrderForm, 'orderFormData'> & { orderFormDataString: string }
  >

  database.close()

  return rows.map(({ orderFormDataString, ...rest }) => ({
    ...rest,

    orderFormData: JSON.parse(orderFormDataString) as OrderForm['orderFormData']
  })) as OrderForm[]
}

export function getUnprocessedOrderFormCount(): number {
  const database = getDatabaseConnection(true)

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
