import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addContractInterment, {
  type AddForm
} from '../../database/addContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { ContractInterment } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddContractInterment`)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddContractIntermentResponse =
  { success: true; contractInterments: ContractInterment[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response<DoAddContractIntermentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addContractInterment(request.body, request.session.user as User, database)

    const contractInterments = getContractInterments(
      request.body.contractId,
      database
    )

    response.json({
      success: true,

      contractInterments
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
