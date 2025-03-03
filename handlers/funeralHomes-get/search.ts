import type { Request, Response } from 'express'

import getFuneralHomes from '../../database/getFuneralHomes.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const funeralHomes = await getFuneralHomes()

  response.render('funeralHome-search', {
    headTitle: `Funeral Home Search`,
    funeralHomes
  })
}
