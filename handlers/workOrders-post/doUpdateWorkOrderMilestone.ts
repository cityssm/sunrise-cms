import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js'
import updateWorkOrderMilestone, {
  type UpdateWorkOrderMilestoneForm
} from '../../database/updateWorkOrderMilestone.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderMilestoneForm & { workOrderId: string }
  >,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateWorkOrderMilestone(
      request.body as UpdateWorkOrderMilestoneForm,
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
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
