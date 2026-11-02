import type { Request, Response } from 'express'

import addContract, {
  type AddContractForm
} from '../../database/addContract.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoCreateContractResponse = {
  contractId: number
}

export default function handler(
  request: Request<unknown, unknown, AddContractForm>,
  response: Response<DoCreateContractResponse>
): void {
  const requestBody = request.body as AddContractForm & {
    markOrderFormAsProcessed?: string
  }
  const contractId = addContract(requestBody, request.session.user as User)

  if (requestBody.markOrderFormAsProcessed === 'true' && requestBody.sourceOrderFormId) {
    import('../../database/updateOrderFormProcessed.js').then(
      ({ default: updateOrderFormProcessed }) => {
        updateOrderFormProcessed(requestBody.sourceOrderFormId, true)
      }
    )
  }

  response.json({
    contractId
  })
}
