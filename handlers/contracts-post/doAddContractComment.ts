import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addContractComment, {
  type AddContractCommentForm
} from '../../database/addContractComment.js'
import getContractComments from '../../database/getContractComments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { ContractComment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doAddContractComment`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddContractCommentResponse =
  { success: true; contractComments: ContractComment[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, AddContractCommentForm>,
  response: Response<DoAddContractCommentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addContractComment(request.body, request.session.user as User, database)

    const contractComments = getContractComments(
      request.body.contractId as string,
      database
    )

    response.json({
      success: true,

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
