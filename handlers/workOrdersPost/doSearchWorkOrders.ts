import type { Request, Response } from 'express'

import {
  type GetWorkOrdersFilters,
  type GetWorkOrdersOptions,
  getWorkOrders
} from '../../database/getWorkOrders.js'
import type { WorkOrder } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoSearchWorkOrdersResponse = {
  count: number
  offset: number
  workOrders: WorkOrder[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetWorkOrdersFilters & GetWorkOrdersOptions
  >,
  response: Response<DoSearchWorkOrdersResponse>
): Promise<void> {
  const result = await getWorkOrders(request.body as GetWorkOrdersFilters, {
    limit: request.body.limit,
    offset: request.body.offset,

    includeBurialSites: true
  })

  response.json({
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Number.parseInt(request.body.offset, 10)
        : request.body.offset,
    workOrders: result.workOrders
  })
}
