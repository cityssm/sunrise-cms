import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addContractInterment, {
  type AddForm
} from '../../database/addContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddContractInterment`)

export default function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addContractInterment(request.body, request.session.user as User)

    const contractInterments = getContractInterments(request.body.contractId)

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
