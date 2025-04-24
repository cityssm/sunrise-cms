import type { Request, Response } from 'express'

import addWorkOrderComment, {
  type AddWorkOrderCommentForm
} from '../../database/addWorkOrderComment.js'
import getWorkOrderComments from '../../database/getWorkOrderComments.js'

export default function handler(
  request: Request<unknown, unknown, AddWorkOrderCommentForm>,
  response: Response
): void {
  addWorkOrderComment(request.body, request.session.user as User)

  const workOrderComments = getWorkOrderComments(request.body.workOrderId)

  response.json({
    success: true,
    workOrderComments
  })
}
