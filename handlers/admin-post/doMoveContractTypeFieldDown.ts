import type { Request, Response } from 'express'

import {
  moveContractTypeFieldDown,
  moveContractTypeFieldDownToBottom
} from '../../database/moveContractTypeField.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveContractTypeFieldDownToBottom(request.body.contractTypeFieldId)
      : moveContractTypeFieldDown(request.body.contractTypeFieldId)

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
