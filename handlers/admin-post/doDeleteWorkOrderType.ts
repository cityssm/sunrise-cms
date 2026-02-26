import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

import type { WorkOrderType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderTypeResponse =
  { success: boolean; workOrderTypes: WorkOrderType[] }

export default function handler(
  request: Request<unknown, unknown, { workOrderTypeId: string }>,
  response: Response<DoDeleteWorkOrderTypeResponse>
): void {
  const success = deleteRecord(
    'WorkOrderTypes',
    request.body.workOrderTypeId,
    request.session.user as User
  )

  const workOrderTypes = getCachedWorkOrderTypes()

  response.json({
    success,

    workOrderTypes
  })
}
