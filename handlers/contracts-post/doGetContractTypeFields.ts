import type { Request, Response } from 'express'

import {
  getAllContractTypeFields,
  getContractTypeById
} from '../../helpers/functions.cache.js'
import type { ContractType } from '../../types/recordTypes.js'

export default async function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response
): Promise<void> {
  const allContractTypeFields = await getAllContractTypeFields()

  const result = (await getContractTypeById(
    Number.parseInt(request.body.contractTypeId, 10)
  )) as ContractType

  const contractTypeFields = [...allContractTypeFields]

  contractTypeFields.push(...(result.contractTypeFields ?? []))

  response.json({
    contractTypeFields
  })
}
