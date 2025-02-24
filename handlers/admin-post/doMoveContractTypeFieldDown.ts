import type { Request, Response } from 'express'

import {
  moveContractTypeFieldDown,
  moveContractTypeFieldDownToBottom
} from '../../database/moveContractTypeField.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveContractTypeFieldDownToBottom(
          request.body.contractTypeFieldId
        )
      : await moveContractTypeFieldDown(request.body.contractTypeFieldId)

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    contractTypes,
    allContractTypeFields
  })
}
