import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addFeeCategory, {
  type AddFeeCategoryForm
} from '../../database/addFeeCategory.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddFeeCategory`)

export default function handler(request: Request, response: Response): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const feeCategoryId = addFeeCategory(
      request.body as AddFeeCategoryForm,
      request.session.user as User
    )

    const feeCategories = getFeeCategories(
      {},
      {
        includeFees: true
      }
    )

    response.json({
      success: true,

      feeCategories,
      feeCategoryId
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
