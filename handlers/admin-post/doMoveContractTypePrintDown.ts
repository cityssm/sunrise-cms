import type { Request, Response } from 'express'

import {
  moveContractTypePrintDown,
  moveContractTypePrintDownToBottom
} from '../../database/moveContractTypePrintDown.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/cache.helpers.js'

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
      ? moveContractTypePrintDownToBottom(
          request.body.contractTypeId,
          request.body.printEJS
        )
      : moveContractTypePrintDown(
          request.body.contractTypeId,
          request.body.printEJS
        )

  const contractTypes = getContractTypes()
  const allContractTypeFields = getAllContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
