import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import deleteContractInterment from '../../database/deleteContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { ContractInterment } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractInterment`
)

export type DoDeleteContractIntermentResponse =
  | { errorMessage: string; success: false }
  | { success: boolean; contractInterments: ContractInterment[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; intermentNumber: string }
  >,
  response: Response<DoDeleteContractIntermentResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteContractInterment(
      request.body.contractId,
      request.body.intermentNumber,
      request.session.user as User,
      database
    )

    const contractInterments = getContractInterments(
      request.body.contractId,
      database
    )

    response.json({
      success,

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
