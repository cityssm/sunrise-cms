import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import deleteContractInterment from '../../database/deleteContractInterment.js'
import getContractInterments from '../../database/getContractInterments.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; intermentNumber: string }
  >,
  response: Response
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

    const contractInterments = getContractInterments(request.body.contractId, database)

    response.json({
      success,

      contractInterments
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
