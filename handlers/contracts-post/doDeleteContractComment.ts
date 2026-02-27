import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getContractComments from '../../database/getContractComments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { ContractComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractComment`
)

export type DoDeleteContractCommentResponse =
  | { errorMessage: string; success: false }
  | {
      success: true

      contractComments: ContractComment[]
    }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractCommentId: string; contractId: string }
  >,
  response: Response<DoDeleteContractCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteRecord(
      'ContractComments',
      request.body.contractCommentId,
      request.session.user as User,
      database
    )

    if (!success) {
      response
        .status(400)
        .json({ errorMessage: 'Comment not found', success: false })
      return
    }

    const contractComments = getContractComments(
      request.body.contractId,
      database
    )

    response.json({
      success,

      contractComments
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
