import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { addWorkOrderType } from '../../database/addRecord.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddWorkOrderType`)

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const workOrderTypeId = addWorkOrderType(
      request.body.workOrderType,
      request.body.orderNumber ?? -1,
      request.session.user as User,
      database
    )

    const workOrderTypes = getCachedWorkOrderTypes()

    response.json({
      success: true,
      workOrderTypeId,
      workOrderTypes
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
