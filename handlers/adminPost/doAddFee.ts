import type { DatabaseSync } from 'node:sqlite'
import { debuglog } from 'node:util'

import type { Request, Response } from 'express'

import addFee, { type AddFeeForm } from '../../database/addFee.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getDatabaseConnection } from '../../helpers/database.helpers.js'
import type { FeeCategory } from '../../types/record.types.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:admin:doAddFee`)

export type DoAddFeeResponse =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true

      feeCategories: FeeCategory[]
      feeId: number
    }

export default function handler(
  request: Request,
  response: Response<DoAddFeeResponse>
): void {
  let database: DatabaseSync | undefined

  try {
    database = getDatabaseConnection()

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
    debug(JSON.stringify(error, undefined, 2))

    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
