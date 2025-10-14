import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'

export default function handler(request: Request, response: Response): void {
  const cemeteries = getCemeteries()

  response.render('burialSites/map', {
    headTitle: 'Burial Site Map (Beta)',
    cemeteries,
    cemeteryId: request.query.cemeteryId ?? ''
  })
}
