import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doDeleteFee`)

export default function handler(
  request: Request<unknown, unknown, { feeId: string }>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'Fees',
      request.body.feeId,
      request.session.user as User
    )

    const feeCategories = getFeeCategories(
      {},
      {
        includeFees: true
      }
    )

    response.json({
      success,

      feeCategories
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
