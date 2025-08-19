import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import deleteContractTransaction from '../../database/deleteContractTransaction.js'
import getContractTransactions from '../../database/getContractTransactions.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; transactionIndex: number }
  >,
  response: Response
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

      contractTransactions
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
