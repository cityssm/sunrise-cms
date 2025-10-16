import type { Request, Response } from 'express'

import {
  moveContractTypePrintUp,
  moveContractTypePrintUpToTop
} from '../../database/moveContractTypePrintUp.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string; moveToEnd: '0' | '1' }
  >,
  response: Response
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
