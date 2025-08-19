import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import getWorkOrderComments from '../../database/getWorkOrderComments.js'
import updateWorkOrderComment, {
  type UpdateWorkOrderCommentForm
} from '../../database/updateWorkOrderComment.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderCommentForm & { workOrderId: string }
  >,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateWorkOrderComment(
      request.body as UpdateWorkOrderCommentForm,
      request.session.user as User,
      database
    )

    const workOrderComments = getWorkOrderComments(request.body.workOrderId, database)

    response.json({
      success,
      workOrderComments
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
