import type { Request, Response } from 'express'

import {
  getAllCachedContractTypeFields,
  getCachedContractTypeById
} from '../../helpers/cache/contractTypes.cache.js'
import type { ContractType } from '../../types/record.types.js'

export default function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response
): void {
  const allContractTypeFields = getAllCachedContractTypeFields()

  const result = getCachedContractTypeById(
    Number.parseInt(request.body.contractTypeId, 10)
  ) as ContractType

  const contractTypeFields = [...allContractTypeFields]

  contractTypeFields.push(...(result.contractTypeFields ?? []))

  response.json({
    contractTypeFields
  })
}
