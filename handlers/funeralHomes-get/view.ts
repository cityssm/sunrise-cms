import type { Request, Response } from 'express'

import getFuneralHome from '../../database/getFuneralHome.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(request: Request, response: Response): void {
  const funeralHome = getFuneralHome(request.params.funeralHomeId)

  if (funeralHome === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/?error=funeralHomeIdNotFound`
    )
    return
  }

  response.render('funeralHome-view', {
    headTitle: funeralHome.funeralHomeName,

    funeralHome
  })
}
