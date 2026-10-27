import {
  getDatabaseConnection,
  sanitizeLimit,
  sanitizeOffset
} from '../helpers/database.helpers.js'
import type { OrderForm } from '../types/record.types.js'

export interface GetOrderFormsFilters {
  isOrderFormProcessed?: boolean
}

export interface GetOrderFormsOptions {
  limit?: number | string
  offset?: number | string
}

export default function getOrderForms(
  filters: GetOrderFormsFilters,
  options: GetOrderFormsOptions = {}
): OrderForm[] | { orderForms: OrderForm[]; count: number } {
  const database = getDatabaseConnection(true)

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

  const hasPaging = options.limit !== undefined || options.offset !== undefined

  const limit = hasPaging
    ? sanitizeLimit(options.limit ?? 50)
    : undefined

  const offset = hasPaging
    ? sanitizeOffset(options.offset ?? 0)
    : undefined

  const countResult = hasPaging
    ? (database
        .prepare(/* sql */ `
          SELECT
            COUNT(*) AS recordCount
          FROM
            OrderForms
          WHERE
            recordDelete_timeMillis IS NULL
          ${filters.isOrderFormProcessed !== undefined ? ' AND isOrderFormProcessed = @isOrderFormProcessed' : ''}
        `)
        .get(sqlParameters) as { recordCount: number } | undefined)
    : undefined

  sql += ' ORDER BY orderFormId DESC'

  if (hasPaging) {
    sql += ` LIMIT ${limit} OFFSET ${offset}`
  }

  const rows = database.prepare(sql).all(sqlParameters) as Array<
    Omit<OrderForm, 'orderFormData'> & { orderFormDataString: string }
  >

  database.close()

  const orderForms = rows.map(({ orderFormDataString, ...rest }) => ({
    ...rest,

    orderFormData: JSON.parse(orderFormDataString) as OrderForm['orderFormData']
  })) as OrderForm[]

  if (hasPaging) {
    return {
      orderForms,
      count: countResult?.recordCount ?? orderForms.length
    }
  }

  return orderForms
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
