import type { Request, Response } from 'express'

import getContractServiceTypes from '../../database/getContractServiceTypes.js'
import updateContractServiceType from '../../database/updateContractServiceType.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      contractId: number | string
      serviceTypeId: number | string
      contractServiceDetails?: string
    }
  >,
  response: Response
): void {
  const success = updateContractServiceType(
    request.body,
    request.session.user as User
  )

  if (success) {
    const contractServiceTypes = getContractServiceTypes(request.body.contractId)

    response.json({
      success: true,
      contractServiceTypes
    })
  } else {
    response.json({
      success: false,
      errorMessage: 'Service Type Not Updated'
    })
  }
}
