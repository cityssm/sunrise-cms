import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'

export default function handler(_request: Request, response: Response): void {
  const cemeteries = getCemeteries()

  response.render('cemetery-search', {
    headTitle: 'Cemetery Search',

    cemeteries
  })
}
