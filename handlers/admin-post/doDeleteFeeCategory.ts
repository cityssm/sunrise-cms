import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { FeeCategory } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doDeleteFeeCategory`)

export type DoDeleteFeeCategoryResponse =
  | { errorMessage: string; success: false }
  | {
      success: true

      feeCategories: FeeCategory[]
    }

export default function handler(
  request: Request<unknown, unknown, { feeCategoryId: string }>,
  response: Response<DoDeleteFeeCategoryResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'FeeCategories',
      request.body.feeCategoryId,
      request.session.user as User,
      database
    )

    if (!success) {
      response
        .status(400)
        .json({ errorMessage: 'Fee category not found', success: false })
      return
    }

    const feeCategories = getFeeCategories(
      {},
      {
        includeFees: true
      },
      database
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
