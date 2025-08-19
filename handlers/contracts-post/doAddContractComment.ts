import sqlite from 'better-sqlite3'
import type { Request, Response } from 'express'

import addContractComment, {
  type AddContractCommentForm
} from '../../database/addContractComment.js'
import getContractComments from '../../database/getContractComments.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

export default function handler(
  request: Request<unknown, unknown, AddContractCommentForm>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    addContractComment(request.body, request.session.user as User, database)

    const contractComments = getContractComments(
      request.body.contractId as string,
      database
    )

    response.json({
      success: true,

      contractComments
    })
  } catch (error) {
    response.status(500).json({ success: false, error: 'Database error' })
  } finally {
    database?.close()
  }
}
