import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import deleteContractFee from '../../database/deleteContractFee.js'
import getContractFees from '../../database/getContractFees.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { contractId: string; feeId: string }>,
  response: Response
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
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
