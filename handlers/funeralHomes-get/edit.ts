import type { Request, Response } from 'express'

import getFuneralHome from '../../database/getFuneralHome.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const funeralHome = await getFuneralHome(request.params.funeralHomeId)

  if (funeralHome === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/?error=funeralHomeIdNotFound`
    )
    return
  }

  response.render('funeralHome-edit', {
    headTitle: funeralHome.funeralHomeName,

    funeralHome,
    isCreate: false
  })
}
