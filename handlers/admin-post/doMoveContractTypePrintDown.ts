import type { Request, Response } from 'express'

import {
  moveContractTypePrintDown,
  moveContractTypePrintDownToBottom
} from '../../database/moveContractTypePrintDown.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveContractTypePrintDownToBottom(
          request.body.contractTypeId,
          request.body.printEJS
        )
      : await moveContractTypePrintDown(
          request.body.contractTypeId,
          request.body.printEJS
        )

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    contractTypes,
    allContractTypeFields
  })
}
