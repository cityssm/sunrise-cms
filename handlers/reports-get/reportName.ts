import type { Request, Response } from 'express'
import papaParse from 'papaparse'

import getReportData, {
  type ReportParameters
} from '../../database/getReportData.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const reportName = request.params.reportName

  const rows = await getReportData(
    reportName,
    request.query as ReportParameters
  )

  if (rows === undefined) {
    response.status(404).json({
      success: false,
      message: 'Report Not Found'
    })

    return
  }

  const csv = papaParse.unparse(rows)

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=${reportName}-${Date.now().toString()}.csv`
  )

  response.setHeader('Content-Type', 'text/csv')

  response.send(csv)
}
