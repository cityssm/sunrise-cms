import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { FeeCategory } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doDeleteFee`)

export type DoDeleteFeeResponse =
  | { errorMessage: string; success: false }
  | { success: boolean; feeCategories: FeeCategory[]; errorMessage: string }

export default function handler(
  request: Request<unknown, unknown, { feeId: string }>,
  response: Response<DoDeleteFeeResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'Fees',
      request.body.feeId,
      request.session.user as User,
      database
    )

    const feeCategories = getFeeCategories(
      {},
      {
        includeFees: true
      },
      database
    )

    response.json({
      success,

      feeCategories,
      errorMessage: success ? '' : 'Failed to delete fee'
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
