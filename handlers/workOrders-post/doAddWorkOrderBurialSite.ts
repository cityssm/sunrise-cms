import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js'
import getBurialSites from '../../database/getBurialSites.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { BurialSite } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderBurialSite`
)

export type DoAddWorkOrderBurialSiteResponse =
  | { errorMessage: string; success: false }
  | {
      success: boolean
      workOrderBurialSites: BurialSite[]
      errorMessage: string
    }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteId: string; workOrderId: string }
  >,
  response: Response<DoAddWorkOrderBurialSiteResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = addWorkOrderBurialSite(
      {
        burialSiteId: request.body.burialSiteId,
        workOrderId: request.body.workOrderId
      },
      request.session.user as User,
      database
    )

    const results = getBurialSites(
      {
        workOrderId: request.body.workOrderId
      },
      {
        limit: -1,
        offset: 0,

        includeContractCount: false
      },
      database
    )

    response.json({
      success,
      workOrderBurialSites: results.burialSites,
      errorMessage: success ? '' : 'Failed to add burial site to work order'
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
