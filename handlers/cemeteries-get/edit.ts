import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getBurialSiteStatusSummary from '../../database/getBurialSiteStatusSummary.js'
import getBurialSiteTypeSummary from '../../database/getBurialSiteTypeSummary.js'
import getCemeteries from '../../database/getCemeteries.js'
import getCemetery from '../../database/getCemetery.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import { getCemeterySVGs } from '../../helpers/images.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:cemeteries:edit`)

export default async function handler(
  request: Request<{ cemeteryId: string }>,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const cemetery = getCemetery(request.params.cemeteryId)

    if (cemetery === undefined) {
      response.redirect(
        `${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=cemeteryIdNotFound`
      )
      return
    }

    const cemeteries = getCemeteries()

    const cemeterySVGs = await getCemeterySVGs()

    const burialSiteTypeSummary = getBurialSiteTypeSummary({
      cemeteryId: cemetery.cemeteryId
    })

    const burialSiteStatusSummary = getBurialSiteStatusSummary({
      cemeteryId: cemetery.cemeteryId
    })

    response.render('cemeteries/edit', {
      headTitle: cemetery.cemeteryName,

      cemetery,
      cemeterySVGs,
      isCreate: false,

      burialSiteStatusSummary,
      burialSiteTypeSummary,
      cemeteries
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
