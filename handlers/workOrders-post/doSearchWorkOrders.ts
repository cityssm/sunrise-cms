import type { Request, Response } from 'express'

import {
  type GetWorkOrdersFilters,
  getWorkOrders
} from '../../database/getWorkOrders.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const result = await getWorkOrders(request.body as GetWorkOrdersFilters, {
    limit: request.body.limit,
    offset: request.body.offset,
    includeBurialSites: true
  })

  response.json({
    count: result.count,
    offset: Number.parseInt(request.body.offset, 10),
    workOrders: result.workOrders
  })
}
