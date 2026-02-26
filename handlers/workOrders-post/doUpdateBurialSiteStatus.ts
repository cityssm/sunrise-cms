import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getBurialSites from '../../database/getBurialSites.js'
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { BurialSite } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateBurialSiteStatus`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateBurialSiteStatusResponse =
  { success: boolean; workOrderBurialSites: BurialSite[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteId: string; burialSiteStatusId: string; workOrderId: string }
  >,
  response: Response<DoUpdateBurialSiteStatusResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateBurialSiteStatus(
      request.body.burialSiteId,
      request.body.burialSiteStatusId,
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

        includeContractCount: true
      },
      database
    )

    response.json({
      success,
      workOrderBurialSites: results.burialSites
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
