import type { Request, Response } from 'express'

import getNextContractId from '../../database/getNextContractId.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<{ contractId: string }>,
  response: Response
): Promise<void> {
  const contractId = Number.parseInt(request.params.contractId, 10)

  const nextContractId = await getNextContractId(contractId)

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
