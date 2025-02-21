import type { Request, Response } from 'express'

import getLot from '../../database/getLot.js'
import getMaps from '../../database/getMaps.js'
import { getLotStatuses, getLotTypes } from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lot = await getLot(request.params.lotId)

  if (lot === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/lots/?error=lotIdNotFound`
    )
    return
  }

  const maps = await getMaps()
  const lotTypes = await getLotTypes()
  const lotStatuses = await getLotStatuses()

  response.render('lot-edit', {
    headTitle: lot.lotName,
    lot,
    isCreate: false,
    maps,
    lotTypes,
    lotStatuses
  })
}
