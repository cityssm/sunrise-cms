import type { Request, Response } from 'express'

import cleanupDatabase from '../../database/cleanupDatabase.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCleanupDatabaseResponse = {
  inactivatedRecordCount: number
  purgedRecordCount: number
}

export default async function handler(
  request: Request,
  response: Response<DoCleanupDatabaseResponse>
): Promise<void> {
  const recordCounts = await cleanupDatabase(request.session.user as User)

  response.json({
    inactivatedRecordCount: recordCounts.inactivatedRecordCount,
    purgedRecordCount: recordCounts.purgedRecordCount
  })
}
