import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import addWorkOrderContract from '../../database/addWorkOrderContract.js'
import getContracts from '../../database/getContracts.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; workOrderId: string; }
  >,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = addWorkOrderContract(
      {
        contractId: request.body.contractId,
        workOrderId: request.body.workOrderId
      },
      request.session.user as User,
      database
    )

    const results = await getContracts(
      {
        workOrderId: request.body.workOrderId
      },
      {
        limit: -1,
        offset: 0,

        includeFees: false,
        includeInterments: true,
        includeTransactions: false
      },
      database
    )

    response.json({
      success,
      workOrderContracts: results.contracts
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
