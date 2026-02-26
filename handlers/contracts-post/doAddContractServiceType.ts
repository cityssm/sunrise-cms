import type { Request, Response } from 'express'

import addContractServiceType from '../../database/addContractServiceType.js'
import getContractServiceTypes from '../../database/getContractServiceTypes.js'

import type { ServiceType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddContractServiceTypeResponse =
  | { success: true; contractServiceTypes: ServiceType[] }
  | { success: false; errorMessage: string }

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
  response: Response<DoAddContractServiceTypeResponse>
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
