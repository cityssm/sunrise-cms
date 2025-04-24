import type { Request, Response } from 'express'

import {
  getAllContractTypeFields,
  getContractTypeById
} from '../../helpers/functions.cache.js'
import type { ContractType } from '../../types/record.types.js'

export default function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response
): void {
  const allContractTypeFields = getAllContractTypeFields()

  const result = getContractTypeById(
    Number.parseInt(request.body.contractTypeId, 10)
  ) as ContractType

  const contractTypeFields = [...allContractTypeFields]

  contractTypeFields.push(...(result.contractTypeFields ?? []))

  response.json({
    contractTypeFields
  })
}
