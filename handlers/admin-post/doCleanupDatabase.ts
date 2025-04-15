import type { Request, Response } from 'express'

import cleanupDatabase from '../../database/cleanupDatabase.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const recordCounts = await cleanupDatabase(request.session.user as User)

  response.json({
    success: true,
    
    inactivatedRecordCount: recordCounts.inactivatedRecordCount,
    purgedRecordCount: recordCounts.purgedRecordCount
  })
}
