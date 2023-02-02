import type { Request, Response } from 'express'

import {
  getReportData,
  type ReportParameters
} from '../../helpers/lotOccupancyDB/getReportData.js'

import papaparse from 'papaparse'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const reportName = request.params.reportName

  let rows: unknown[] | undefined

  switch (reportName) {
    default: {
      rows = await getReportData(reportName, request.query as ReportParameters)
      break
    }
  }

  if (rows === undefined) {
    response.status(404).json({
      success: false,
      message: 'Report Not Found'
    })

    return
  }

  const csv = papaparse.unparse(rows)

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=${reportName}-${Date.now().toString()}.csv`
  )

  response.setHeader('Content-Type', 'text/csv')

  response.send(csv)
}

export default handler
