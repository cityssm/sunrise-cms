import type { Request, Response } from 'express'

import addContractServiceType from '../../database/addContractServiceType.js'
import getContractServiceTypes from '../../database/getContractServiceTypes.js'

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
  const success = addContractServiceType(
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
      errorMessage: 'Service Type Already Added or Invalid'
    })
  }
}
