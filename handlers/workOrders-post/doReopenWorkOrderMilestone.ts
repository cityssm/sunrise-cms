import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import reopenWorkOrderMilestone from '../../database/reopenWorkOrderMilestone.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { WorkOrderMilestone } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doReopenWorkOrderMilestone`
)

export type DoReopenWorkOrderMilestoneResponse =
  | { errorMessage: string; success: false }
  | { success: boolean; workOrderMilestones: WorkOrderMilestone[] }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; workOrderMilestoneId: string }
  >,
  response: Response<DoReopenWorkOrderMilestoneResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = reopenWorkOrderMilestone(
      request.body.workOrderMilestoneId,
      request.session.user as User,
      database
    )

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
