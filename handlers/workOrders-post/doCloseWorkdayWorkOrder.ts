import type { DateString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import closeWorkOrder from '../../database/closeWorkOrder.js'
import getWorkOrders from '../../database/getWorkOrders.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doCloseWorkdayWorkOrder`
)
export type DoCloseWorkdayWorkOrderResponse =
  | { errorMessage: string; success: false }
  | { success: true; workOrders: WorkOrder[] }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workdayDateString: DateString; workOrderId: string }
  >,
  response: Response<DoCloseWorkdayWorkOrderResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = closeWorkOrder(
      request.body,
      request.session.user as User,
      database
    )

    if (!success) {
      response.status(400).json({
        errorMessage: 'Failed to close work order',
        success: false
      })
      return
    }

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
