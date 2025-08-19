import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import addContractFee, {
  type AddContractFeeForm
} from '../../database/addContractFee.js'
import getContractFees from '../../database/getContractFees.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, AddContractFeeForm>,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    await addContractFee(request.body, request.session.user as User, database)

    const contractFees = getContractFees(request.body.contractId as string, database)

    response.json({
      success: true,

      contractFees
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
