import type { Request, Response } from 'express'

import getWorkOrderComments from '../../database/getWorkOrderComments.js'
import updateWorkOrderComment, {
  type UpdateWorkOrderCommentForm
} from '../../database/updateWorkOrderComment.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderCommentForm & { workOrderId: string }
  >,
  response: Response
): void {
  const success = updateWorkOrderComment(
    request.body as UpdateWorkOrderCommentForm,
    request.session.user as User
  )

  const workOrderComments = getWorkOrderComments(request.body.workOrderId)

  response.json({
    success,
    workOrderComments
  })
}
