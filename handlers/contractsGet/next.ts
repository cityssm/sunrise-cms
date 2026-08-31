import type { Request, Response } from 'express'

import getNextContractId from '../../database/getNextContractId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ contractId: string }>,
  response: Response
): void {
  const contractId = Math.trunc(Number(request.params.contractId))

  const nextContractId = getNextContractId(contractId)

  if (nextContractId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/contracts/?error=noNextContractIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/contracts/${nextContractId.toString()}`
  )
}
