import type { Request, Response } from 'express'

import getPreviousContractId from '../../database/getPreviousContractId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<{ contractId: string }>,
  response: Response
): void {
  const contractId = Number.parseInt(request.params.contractId, 10)

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
