import type { Request, Response } from 'express'

import {
  moveContractTypeFieldUp,
  moveContractTypeFieldUpToTop
} from '../../database/moveContractTypeField.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import type {
  ContractType,
  ContractTypeField
} from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveContractTypeFieldUpResponse = {
  success: boolean

  allContractTypeFields: ContractTypeField[]
  contractTypes: ContractType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveContractTypeFieldUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveContractTypeFieldUpToTop(request.body.contractTypeFieldId)
      : moveContractTypeFieldUp(request.body.contractTypeFieldId)

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
