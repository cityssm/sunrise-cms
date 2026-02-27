import type { Request, Response } from 'express'

import { addWorkOrderType } from '../../database/addRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import type { WorkOrderType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddWorkOrderTypeResponse = {
  success: true
  workOrderTypeId: number
  workOrderTypes: WorkOrderType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderType: string; orderNumber?: number | string }
  >,
  response: Response<DoAddWorkOrderTypeResponse>
): void {
  const workOrderTypeId = addWorkOrderType(
    request.body.workOrderType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const workOrderTypes = getCachedWorkOrderTypes()

  response.json({
    success: true,
    workOrderTypeId,
    workOrderTypes
  })
}
