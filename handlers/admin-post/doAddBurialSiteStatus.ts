import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { addBurialSiteStatus } from '../../database/addRecord.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddBurialSiteStatus`)

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatus: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const burialSiteStatusId = addBurialSiteStatus(
      request.body.burialSiteStatus,
      request.body.orderNumber ?? -1,
      request.session.user as User,
      database
    )

    const burialSiteStatuses = getCachedBurialSiteStatuses()

    response.json({
      success: true,

      burialSiteStatuses,
      burialSiteStatusId
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
