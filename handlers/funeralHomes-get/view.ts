import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getContracts from '../../database/getContracts.js'
import getFuneralHome from '../../database/getFuneralHome.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:funeralHomes:view`)

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const funeralHome = getFuneralHome(
      request.params.funeralHomeId,
      request.session.user?.userProperties.canUpdateContracts,
      database
    )

    if (funeralHome === undefined) {
      response.redirect(
        `${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/?error=funeralHomeIdNotFound`
      )
      return
    }

    const contracts = await getContracts(
      {
        funeralHomeId: funeralHome.funeralHomeId,
        funeralTime: 'upcoming'
      },
      {
        limit: -1,
        offset: 0,

        orderBy: 'c.funeralDate, c.funeralTime, c.contractId',

        includeFees: false,
        includeInterments: true,
        includeTransactions: false
      },
      database
    )

    response.render('funeralHomes/view', {
      headTitle: funeralHome.funeralHomeName,

      funeralHome,

      contracts: contracts.contracts
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
