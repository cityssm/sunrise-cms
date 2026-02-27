import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import deleteContractTransaction from '../../database/deleteContractTransaction.js'
import getContractTransactions from '../../database/getContractTransactions.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { ContractTransaction } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractTransaction`
)

export type DoDeleteContractTransactionResponse =
  | { errorMessage: string; success: false }
  | {
      success: boolean

      errorMessage: string

      contractTransactions: ContractTransaction[]
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; transactionIndex: number }
  >,
  response: Response<DoDeleteContractTransactionResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteContractTransaction(
      request.body.contractId,
      request.body.transactionIndex,
      request.session.user as User,
      database
    )

    const contractTransactions = await getContractTransactions(
      request.body.contractId,
      {
        includeIntegrations: true
      },
      database
    )

    response.json({
      success,

      contractTransactions,

      errorMessage: success ? '' : 'Failed to delete transaction'
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
