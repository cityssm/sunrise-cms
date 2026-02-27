import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import updateFeeCategory, {
  type UpdateFeeCategoryForm
} from '../../database/updateFeeCategory.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { FeeCategory } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateFeeCategory`)

export type DoUpdateFeeCategoryResponse =
  | { errorMessage: string; success: false }
  | { success: true; feeCategories: FeeCategory[] }

export default function handler(
  request: Request,
  response: Response<DoUpdateFeeCategoryResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateFeeCategory(
      request.body as UpdateFeeCategoryForm,
      request.session.user as User,
      database
    )

    if (!success) {
      response
        .status(400)
        .json({ errorMessage: 'Failed to update fee category', success: false })
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
