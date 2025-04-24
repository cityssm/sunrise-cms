import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getWorkOrderComments from '../../database/getWorkOrderComments.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderCommentId: string; workOrderId: string }
  >,
  response: Response
): void {
  const success = deleteRecord(
    'WorkOrderComments',
    request.body.workOrderCommentId,
    request.session.user as User
  )

  const workOrderComments = getWorkOrderComments(request.body.workOrderId)

  response.json({
    success,
    workOrderComments
  })
}
