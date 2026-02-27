import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addContractFee, {
  type AddContractFeeForm
} from '../../database/addContractFee.js'
import getContractFees from '../../database/getContractFees.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { ContractFee } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doAddContractFee`)

export type DoAddContractFeeResponse =
  | { errorMessage: string; success: false }
  | { success: true; contractFees: ContractFee[] }

export default async function handler(
  request: Request<unknown, unknown, AddContractFeeForm>,
  response: Response<DoAddContractFeeResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    await addContractFee(request.body, request.session.user as User, database)

    const contractFees = getContractFees(
      request.body.contractId as string,
      database
    )

    response.json({
      success: true,

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
