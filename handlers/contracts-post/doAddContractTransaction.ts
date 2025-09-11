import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addContractTransaction, {
  type AddTransactionForm
} from '../../database/addContractTransaction.js'
import getContractTransactions from '../../database/getContractTransactions.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doAddContractTransaction`
)

export default async function handler(
  request: Request<unknown, unknown, AddTransactionForm>,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addContractTransaction(request.body, request.session.user as User)

    const contractTransactions = await getContractTransactions(
      request.body.contractId,
      {
        includeIntegrations: true
      }
    )

    response.json({
      success: true,

      contractTransactions
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
