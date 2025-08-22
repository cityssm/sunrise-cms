import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { addWorkOrderMilestoneType } from '../../database/addRecord.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddWorkOrderMilestoneType`)

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const workOrderMilestoneTypeId = addWorkOrderMilestoneType(
      request.body.workOrderMilestoneType,
      request.body.orderNumber ?? -1,
      request.session.user as User,
      database
    )

    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

    response.json({
      success: true,
      workOrderMilestoneTypeId,
      workOrderMilestoneTypes
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
