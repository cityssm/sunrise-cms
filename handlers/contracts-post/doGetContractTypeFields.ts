import type { Request, Response } from 'express'

import {
  getAllCachedContractTypeFields,
  getCachedContractTypeById
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetContractTypeFieldsResponse = {
  contractTypeFields: ContractTypeField[]
}

export default function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response<DoGetContractTypeFieldsResponse>
): void {
  const allContractTypeFields = getAllCachedContractTypeFields()

  const result = getCachedContractTypeById(
    Number.parseInt(request.body.contractTypeId, 10)
  ) as ContractType

  const contractTypeFields = [
    ...allContractTypeFields,
    ...(result.contractTypeFields ?? [])
  ]

  response.json({
    contractTypeFields
  })
}
