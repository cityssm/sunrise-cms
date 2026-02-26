import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addWorkOrderMilestone, {
  type AddWorkOrderMilestoneForm
} from '../../database/addWorkOrderMilestone.js'
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { WorkOrderMilestone } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderMilestone`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddWorkOrderMilestoneResponse =
  { success: number; workOrderMilestones: WorkOrderMilestone[] }
  | { errorMessage: string; success: false }

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderMilestoneForm>,
  response: Response<DoAddWorkOrderMilestoneResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = addWorkOrderMilestone(
      request.body,
      request.session.user as User
    )

    const workOrderMilestones = await getWorkOrderMilestones(
      {
        workOrderId: request.body.workOrderId
      },
      {
        orderBy: 'completion'
      }
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
