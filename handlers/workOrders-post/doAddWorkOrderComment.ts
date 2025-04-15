import type { Request, Response } from 'express'

import addWorkOrderComment, {
  type AddWorkOrderCommentForm
} from '../../database/addWorkOrderComment.js'
import getWorkOrderComments from '../../database/getWorkOrderComments.js'

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderCommentForm>,
  response: Response
): Promise<void> {
  await addWorkOrderComment(request.body, request.session.user as User)

  const workOrderComments = await getWorkOrderComments(
    request.body.workOrderId as string
  )

  response.json({
    success: true,
    workOrderComments
  })
}
