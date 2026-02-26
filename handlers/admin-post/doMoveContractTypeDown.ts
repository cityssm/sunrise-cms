import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

import type { ContractType, ContractTypeField } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveContractTypeDownResponse =
  { success: boolean; allContractTypeFields: ContractTypeField[]; contractTypes: ContractType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveContractTypeDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('ContractTypes', request.body.contractTypeId)
      : moveRecordDown('ContractTypes', request.body.contractTypeId)

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
