import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { WorkOrderMilestone } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderMilestone`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderMilestoneResponse =
  { success: boolean; workOrderMilestones: WorkOrderMilestone[] }
  | { errorMessage: string; success: false }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderId: string; workOrderMilestoneId: string }
  >,
  response: Response<DoDeleteWorkOrderMilestoneResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'WorkOrderMilestones',
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
