import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import {
  type UpdateFeeAmountForm,
  updateFeeAmount
} from '../../database/updateFee.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { FeeCategory } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateFeeAmount`)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateFeeAmountResponse =
  { success: boolean; feeCategories: FeeCategory[] }
  | { errorMessage: string; success: false }

export default function handler(request: Request, response: Response<DoUpdateFeeAmountResponse>): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateFeeAmount(
      request.body as UpdateFeeAmountForm,
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
