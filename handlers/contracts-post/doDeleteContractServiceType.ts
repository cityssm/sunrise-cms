import type { Request, Response } from 'express'

import deleteContractServiceType from '../../database/deleteContractServiceType.js'
import getContractServiceTypes from '../../database/getContractServiceTypes.js'
import type { ServiceType } from '../../types/record.types.js'

export type DoDeleteContractServiceTypeResponse =
  | {
      success: false
    }
  | {
      success: true

      contractServiceTypes: ServiceType[]
    }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: number | string; serviceTypeId: number | string }
  >,
  response: Response<DoDeleteContractServiceTypeResponse>
): void {
  const success = deleteContractServiceType(
    request.body.contractId,
    request.body.serviceTypeId,
    request.session.user as User
  )

  if (success) {
    const contractServiceTypes = getContractServiceTypes(
      request.body.contractId
    )

    response.json({
      success: true,

      contractServiceTypes
    })
  } else {
    response.json({
      success: false
    })
  }
}
