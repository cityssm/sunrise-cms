import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getWorkOrderComments from '../../database/getWorkOrderComments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { WorkOrderComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderComment`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderCommentResponse =
  { success: boolean; workOrderComments: WorkOrderComment[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderCommentId: string; workOrderId: string }
  >,
  response: Response<DoDeleteWorkOrderCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'WorkOrderComments',
      request.body.workOrderCommentId,
      request.session.user as User,
      database
    )

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
