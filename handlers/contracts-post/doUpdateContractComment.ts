import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import getContractComments from '../../database/getContractComments.js'
import updateContractComment, {
  type UpdateForm
} from '../../database/updateContractComment.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default function handler(
  request: Request<unknown, unknown, UpdateForm & { contractId: string }>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateContractComment(
      request.body,
      request.session.user as User,
      database
    )

    const contractComments = getContractComments(request.body.contractId, database)

    response.json({
      success,

      contractComments
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
