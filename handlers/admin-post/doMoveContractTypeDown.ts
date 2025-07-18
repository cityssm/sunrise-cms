import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('ContractTypes', request.body.contractTypeId)
      : moveRecordDown('ContractTypes', request.body.contractTypeId)

  const contractTypes = getContractTypes()
  const allContractTypeFields = getAllContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
