import type { Request, Response } from 'express'

import {
  moveContractTypePrintUp,
  moveContractTypePrintUpToTop
} from '../../database/moveContractTypePrintUp.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

import type { ContractType, ContractTypeField } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveContractTypePrintUpResponse =
  { success: boolean; allContractTypeFields: ContractTypeField[]; contractTypes: ContractType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveContractTypePrintUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveContractTypePrintUpToTop(
          request.body.contractTypeId,
          request.body.printEJS
        )
      : moveContractTypePrintUp(
          request.body.contractTypeId,
          request.body.printEJS
        )

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
