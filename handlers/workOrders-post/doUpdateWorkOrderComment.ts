import type { Request, Response } from 'express'

import { updateWorkOrderComment } from '../../helpers/lotOccupancyDB/updateWorkOrderComment.js'

import { getWorkOrderComments } from '../../helpers/lotOccupancyDB/getWorkOrderComments.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = updateWorkOrderComment(request.body, request.session)

  const workOrderComments = getWorkOrderComments(request.body.workOrderId)

  response.json({
    success,
    workOrderComments
  })
}

export default handler
