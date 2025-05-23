import type { Request, Response } from 'express'
import papaParse from 'papaparse'

import getReportData, {
  type ReportParameters
} from '../../database/getReportData.js'

export default function handler(
  request: Request<{ reportName: string }, unknown, unknown, ReportParameters>,
  response: Response
): void {
  const reportName = request.params.reportName

  const rows = getReportData(reportName, request.query)

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
