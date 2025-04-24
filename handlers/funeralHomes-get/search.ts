import type { Request, Response } from 'express'

import getFuneralHomes from '../../database/getFuneralHomes.js'

export default function handler(_request: Request, response: Response): void {
  const funeralHomes = getFuneralHomes()

  response.render('funeralHome-search', {
    headTitle: 'Funeral Home Search',

    funeralHomes
  })
}
