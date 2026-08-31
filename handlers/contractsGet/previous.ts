import type { Request, Response } from 'express'

import getPreviousContractId from '../../database/getPreviousContractId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ contractId: string }>,
  response: Response
): void {
  const contractId = Math.trunc(Number(request.params.contractId))

  const previousContractId = getPreviousContractId(contractId)

  if (previousContractId === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/contracts/?error=noPreviousContractIdFound`
    )
    return
  }

  response.redirect(
    `${getConfigProperty(
      'reverseProxy.urlPrefix'
    )}/contracts/${previousContractId.toString()}`
  )
}
