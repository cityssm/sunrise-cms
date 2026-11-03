import type { DatabaseSync } from 'node:sqlite'
import { debuglog } from 'node:util'

import type { Request, Response } from 'express'

import getWorkOrderComments from '../../database/getWorkOrderComments.js'
import updateWorkOrderComment, {
  type UpdateWorkOrderCommentForm
} from '../../database/updateWorkOrderComment.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getDatabaseConnection } from '../../helpers/database.helpers.js'
import type { WorkOrderComment } from '../../types/record.types.js'

const debug = debuglog(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateWorkOrderComment`
)

export type DoUpdateWorkOrderCommentResponse =
  | {
      success: false

      errorMessage: string
    }
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
  let database: DatabaseSync | undefined

  try {
    database = getDatabaseConnection()

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
    debug(JSON.stringify(error, undefined, 2))

    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
