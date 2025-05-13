import type { Request, Response } from 'express'

import cleanupDatabase from '../../database/cleanupDatabase.js'

export default function handler(request: Request, response: Response): void {
  const recordCounts = cleanupDatabase(request.session.user as User)

  response.json({
    success: true,

    inactivatedRecordCount: recordCounts.inactivatedRecordCount,
    purgedRecordCount: recordCounts.purgedRecordCount
  })
}
