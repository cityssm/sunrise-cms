import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import completeWorkOrderMilestone from '../../database/completeWorkOrderMilestone.js'
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { WorkOrderMilestone } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doCompleteWorkOrderMilestone`
)

export type DoCompleteWorkOrderMilestoneResponse =
  | { errorMessage: string; success: false }
  | { success: true; workOrderMilestones: WorkOrderMilestone[] }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; workOrderMilestoneId: string }
  >,
  response: Response<DoCompleteWorkOrderMilestoneResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = completeWorkOrderMilestone(
      {
        workOrderMilestoneId: request.body.workOrderMilestoneId
      },
      request.session.user as User,
      database
    )

    if (!success) {
      response.status(400).json({
        errorMessage: 'Failed to complete work order milestone',
        success: false
      })
      return
    }

    const workOrderMilestones = await getWorkOrderMilestones(
      {
        workOrderId: request.body.workOrderId
      },
      {
        orderBy: 'completion'
      },
      database
    )

    response.json({
      success,
      workOrderMilestones
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
