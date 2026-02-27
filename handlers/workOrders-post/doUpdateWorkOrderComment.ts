import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getWorkOrderComments from '../../database/getWorkOrderComments.js'
import updateWorkOrderComment, {
  type UpdateWorkOrderCommentForm
} from '../../database/updateWorkOrderComment.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { WorkOrderComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateWorkOrderComment`
)

export type DoUpdateWorkOrderCommentResponse =
  | { errorMessage: string; success: false }
  | {
      success: true
      workOrderComments: WorkOrderComment[]
    }

export default function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderCommentForm & { workOrderId: string }
  >,
  response: Response<DoUpdateWorkOrderCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateWorkOrderComment(
      request.body as UpdateWorkOrderCommentForm,
      request.session.user as User,
      database
    )

    if (!success) {
      response
        .status(400)
        .json({ errorMessage: 'Failed to update comment', success: false })
      return
    }

    const workOrderComments = getWorkOrderComments(
      request.body.workOrderId,
      database
    )

    response.json({
      success,
      workOrderComments
    })
  } catch (error) {
    debug(error)
    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
