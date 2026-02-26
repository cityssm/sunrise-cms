import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import deleteContractFee from '../../database/deleteContractFee.js'
import getContractFees from '../../database/getContractFees.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { ContractFee } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractFee`)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteContractFeeResponse =
  { success: boolean; contractFees: ContractFee[] }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, { contractId: string; feeId: string }>,
  response: Response<DoDeleteContractFeeResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteContractFee(
      request.body.contractId,
      request.body.feeId,
      request.session.user as User,
      database
    )

    const contractFees = getContractFees(request.body.contractId, database)

    response.json({
      success,

      contractFees
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
