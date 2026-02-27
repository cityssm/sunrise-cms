import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import deleteWorkOrderBurialSite from '../../database/deleteWorkOrderBurialSite.js'
import getBurialSites from '../../database/getBurialSites.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { BurialSite } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderBurialSite`
)

export type DoDeleteWorkOrderBurialSiteResponse =
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
  response: Response<DoDeleteWorkOrderBurialSiteResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteWorkOrderBurialSite(
      request.body.workOrderId,
      request.body.burialSiteId,
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
      errorMessage: success
        ? ''
        : 'Failed to delete burial site from work order.'
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
