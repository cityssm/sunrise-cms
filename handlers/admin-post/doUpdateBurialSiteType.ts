import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import updateBurialSiteType, {
  type UpdateBurialSiteTypeForm
} from '../../database/updateBurialSiteType.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateBurialSiteType`)

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteTypeForm>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateBurialSiteType(
      request.body,
      request.session.user as User,
      database
    )

    const burialSiteTypes = getCachedBurialSiteTypes()

    response.json({
      success,

      burialSiteTypes
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
