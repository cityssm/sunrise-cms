import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addWorkOrderComment, {
  type AddWorkOrderCommentForm
} from '../../database/addWorkOrderComment.js'
import getWorkOrderComments from '../../database/getWorkOrderComments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { WorkOrderComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderComment`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddWorkOrderCommentResponse =
  { success: true; workOrderComments: WorkOrderComment[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, AddWorkOrderCommentForm>,
  response: Response<DoAddWorkOrderCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addWorkOrderComment(request.body, request.session.user as User, database)

    const workOrderComments = getWorkOrderComments(
      request.body.workOrderId,
      database
    )

    response.json({
      success: true,
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
