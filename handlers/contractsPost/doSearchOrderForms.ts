import type { Request, Response } from 'express'

import getOrderForms, {
  type GetOrderFormsFilters
} from '../../database/getOrderForms.js'
import type { OrderForm } from '../../types/record.types.js'

export type DoSearchOrderFormsRequest = Omit<
  GetOrderFormsFilters,
  'isOrderFormProcessed'
> & {
  limit?: number | string
  offset?: number | string
  isOrderFormProcessed?: 'all' | 'processed' | 'notProcessed' | boolean
}

export type DoSearchOrderFormsResponse = {
  orderForms: OrderForm[]
  count: number
  offset: number
}

export default function handler(
  request: Request<unknown, unknown, DoSearchOrderFormsRequest>,
  response: Response<DoSearchOrderFormsResponse>
): void {
  const filters: GetOrderFormsFilters = {}

  const processedFilter = request.body.isOrderFormProcessed

  if (processedFilter === 'processed') {
    filters.isOrderFormProcessed = true
  } else if (processedFilter === 'notProcessed') {
    filters.isOrderFormProcessed = false
  } else if (typeof processedFilter === 'boolean') {
    filters.isOrderFormProcessed = processedFilter
  }

  const result = getOrderForms(filters, {
    limit: request.body.limit,
    offset: request.body.offset
  })

  if (Array.isArray(result)) {
    response.json({
      orderForms: result,
      count: result.length,
      offset: 0
    })
    return
  }

  response.json({
    orderForms: result.orderForms,
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Math.trunc(Number(request.body.offset))
        : request.body.offset ?? 0
  })
}
