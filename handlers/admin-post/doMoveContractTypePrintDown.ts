import type { Request, Response } from 'express'

import {
  moveContractTypePrintDown,
  moveContractTypePrintDownToBottom
} from '../../database/moveContractTypePrintDown.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

import type { ContractType, ContractTypeField } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveContractTypePrintDownResponse =
  { success: boolean; allContractTypeFields: ContractTypeField[]; contractTypes: ContractType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveContractTypePrintDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveContractTypePrintDownToBottom(
          request.body.contractTypeId,
          request.body.printEJS
        )
      : moveContractTypePrintDown(
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
