import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getWorkOrderComments from '../../database/getWorkOrderComments.js'

export default function handler(request: Request, response: Response): void {
  const success = deleteRecord(
    'WorkOrderComments',
    request.body.workOrderCommentId as string,
    request.session.user as User
  )

  const workOrderComments = getWorkOrderComments(
    request.body.workOrderId as string
  )

  response.json({
    success,
    workOrderComments
  })
}
