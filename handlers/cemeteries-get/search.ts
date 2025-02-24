import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const cemeteries = await getCemeteries()

  response.render('cemetery-search', {
    headTitle: `Cemetery Search`,
    cemeteries
  })
}
