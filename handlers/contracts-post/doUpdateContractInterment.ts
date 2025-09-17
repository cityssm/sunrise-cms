import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getContractInterments from '../../database/getContractInterments.js'
import updateContractInterment, {
  type UpdateForm
} from '../../database/updateContractInterment.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doUpdateContractInterment`
)

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    updateContractInterment(
      request.body,
      request.session.user as User,
      database
    )

    const contractInterments = getContractInterments(
      request.body.contractId,
      database
    )

    response.json({
      success: true,

      contractInterments
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
