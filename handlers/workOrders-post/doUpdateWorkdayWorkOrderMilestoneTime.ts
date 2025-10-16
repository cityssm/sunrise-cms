import type { DateString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getWorkOrders from '../../database/getWorkOrders.js'
import {
  type UpdateWorkOrderMilestoneTimeForm,
  updateWorkOrderMilestoneTime
} from '../../database/updateWorkOrderMilestoneTime.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateWorkdayWorkOrderMilestoneTime`
)

export default async function handler(
  request: Request<
    unknown,
    unknown,
    UpdateWorkOrderMilestoneTimeForm & { workdayDateString: DateString }
  >,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateWorkOrderMilestoneTime(
      request.body as UpdateWorkOrderMilestoneTimeForm,
      request.session.user as User,
      database
    )

    const result = await getWorkOrders(
      {
        workOrderMilestoneDateString: request.body.workdayDateString
      },
      {
        limit: -1,
        offset: 0,

        includeBurialSites: true,
        includeMilestones: true
      },
      database
    )

    response.json({
      success,
      workOrders: result.workOrders
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
