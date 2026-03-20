import type { Request, Response } from 'express'

import updateContractType, {
  type UpdateForm
} from '../../database/updateContractType.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateContractTypeResponse = {
  success: boolean

  allContractTypeFields: ContractTypeField[]
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response<DoUpdateContractTypeResponse>
): void {
  const success = updateContractType(request.body, request.session.user as User)

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
