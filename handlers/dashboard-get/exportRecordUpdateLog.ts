import type { Request, Response } from 'express'
import papaParse from 'papaparse'

import getRecordUpdateLog, {
  type RecordType
} from '../../database/getRecordUpdateLog.js'

export default function handler(
  request: Request<unknown, unknown, unknown, { recordType?: '' | RecordType }>,
  response: Response
): void {
  const recordType = request.query.recordType ?? ''

  const updateLog = getRecordUpdateLog(
    {
      recordType
    },
    {
      limit: 1000, // Max limit for export to avoid overwhelming the system
      offset: 0,
      sortBy: 'recordUpdate_timeMillis',
      sortDirection: 'desc'
    }
  )

  // Transform the data for CSV export
  const csvData = updateLog.map((entry) => ({
    recordType: entry.recordType,
    updateType: entry.updateType,
    displayRecordId: entry.displayRecordId,
    recordDescription: entry.recordDescription,
    updateDateTime: new Date(entry.recordUpdate_timeMillis).toISOString(),
    updateUser: entry.recordUpdate_userName,
    createDateTime: new Date(entry.recordCreate_timeMillis).toISOString(),
    createUser: entry.recordCreate_userName
  }))

  const csv = papaParse.unparse(csvData)

  const filename = `update-log${recordType ? `-${recordType}` : ''}-${Date.now()}.csv`

  response.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  response.setHeader('Content-Type', 'text/csv')
  response.send(csv)
}