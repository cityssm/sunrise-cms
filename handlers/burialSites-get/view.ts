import type { Request, Response } from 'express'

import getLot from '../../database/getLot.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getNextLotId, getPreviousLotId } from '../../helpers/functions.lots.js'

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

  response.render('lot-view', {
    headTitle: lot.lotName,
    lot
  })

  response.on('finish', () => {
    void getNextLotId(lot.lotId)
    void getPreviousLotId(lot.lotId)
  })
}
