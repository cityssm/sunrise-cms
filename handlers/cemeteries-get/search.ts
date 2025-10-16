import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'

export default function handler(request: Request, response: Response): void {
  let error = request.query.error

  switch (error) {
    case 'cemeteryIdNotFound': {
      error = 'Cemetery ID not found.'

      break
    }
    case 'noNextCemeteryIdFound': {
      error = 'No next Cemetery ID found.'

      break
    }
    case 'noPreviousCemeteryIdFound': {
      error = 'No previous Cemetery ID found.'

      break
    }
    // No default
  }

  const cemeteries = getCemeteries()

  response.render('cemeteries/search', {
    headTitle: 'Cemetery Search',

    cemeteries,

    error
  })
}
