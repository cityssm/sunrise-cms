import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addFee, { type AddFeeForm } from '../../database/addFee.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { FeeCategory } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddFee`)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddFeeResponse =
  { success: true; feeCategories: FeeCategory[]; feeId: number }
  | { errorMessage: string; success: false }

export default function handler(request: Request, response: Response<DoAddFeeResponse>): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const feeId = addFee(
      request.body as AddFeeForm,
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
      success: true,

      feeCategories,
      feeId
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
